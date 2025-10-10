// backend.js
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

// ===== middleware =====
app.use(cors());
app.use(express.json());

// ===== Mongo connection =====
let registerDB;
let recordDB;

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();

  registerDB = client.db("fitness_register_db");
  recordDB = client.db("fitness_recording_db");

  console.log("Connected to MongoDB:");
  console.log(" - Register DB: fitness_register_db");
  console.log(" - Recording DB: fitness_recording_db");
}

// ===== Register =====
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const users = registerDB.collection("users");

    const existing = await users.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const result = await users.insertOne({
      name,
      email,
      password,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User registered", id: result.insertedId });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check for missing fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    // connect fitness_register_db
    const registerClient = new MongoClient(uri);
    await registerClient.connect();
    const db = registerClient.db("fitness_register_db");
    const users = db.collection("users");

    // find user by email
    const user = await users.findOne({ email });

    if (!user) {
      await registerClient.close();
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    // check password
    if (user.password !== password) {
      await registerClient.close();
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password." });
    }

    // successful login
    await registerClient.close();
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      userId: user._id,
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// ===== fitness recording CRUD =====

// Create
app.post("/api/fitness", async (req, res) => {
  try {
    const { uid, sportType, duration, date, description } = req.body;
    if (!uid || !sportType || !duration || !date)
      return res.status(400).json({ error: "Missing required fields" });

    const records = recordDB.collection("fitness_records");

    const result = await records.insertOne({
      uid: new ObjectId(uid),
      sportType,
      duration,
      date: new Date(date),
      description,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Record added", id: result.insertedId });
  } catch (err) {
    console.error("Create record error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Read
app.get("/api/fitness/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const records = recordDB.collection("fitness_records");

    const userRecords = await records
      .find({ uid: new ObjectId(uid) })
      .toArray();
    res.json(userRecords);
  } catch (err) {
    console.error("Read records error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update
app.put("/api/fitness/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sportType, duration, date, description } = req.body;
    const records = recordDB.collection("fitness_records");

    const result = await records.updateOne(
      { _id: new ObjectId(id) },
      { $set: { sportType, duration, date: new Date(date), description } },
    );

    res.json({
      message: "Record updated",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Update record error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete
app.delete("/api/fitness/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const records = recordDB.collection("fitness_records");

    const result = await records.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Record deleted", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Delete record error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===== AI-Generated Fitness Plan =====
app.post("/api/plan", async (req, res) => {
  try {
    const { records, userInfo } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

    // 1. Build a workout summary (handles empty records gracefully)
    let summary;
    if (!records || !Array.isArray(records) || records.length === 0) {
      summary =
        "This user has no previous workout records. Assume they are a beginner starting their fitness journey.";
    } else {
      summary = records
        .map(
          (r) =>
            `• ${r.sportType || r.sport} for ${r.duration} min on ${new Date(
              r.date
            ).toLocaleDateString()}${r.description ? ` (${r.description})` : ""}`
        )
        .join("\n");
    }

    // 2. Add user profile info
    const { height, weight, targetWeight, activity } = userInfo || {};
    const profileText = `
User Profile:
- Height: ${height || "N/A"} cm
- Current Weight: ${weight || "N/A"} kg
- Target Weight: ${targetWeight || "N/A"} kg
- Activity Level: ${activity || "N/A"}
`;

    // 3. Build final AI prompt
    const prompt = `
You are a certified personal trainer and fitness coach.

${profileText}

Here is this user's recent workout history:
${summary}

---

### Your Task:
1. Start with a **brief summary paragraph (2-4 sentences)** analyzing the workout history and overall fitness level.
   - Write it **in the second person ("you have")**, as if you are directly addressing the user.
   - Describe what their history shows (frequency, type, intensity, or lack thereof).
   - Comment on how this informs your upcoming 4-week plan design.
2. Then create a **4-week personalized fitness plan**.

Guidelines for the plan:
- Focus on gradual progression and safe intensity for their current level.
- Tailor the plan toward their target weight and activity level.
- Each week should include 4-5 workout sessions and 1-2 rest/recovery days.
- Suggest workout types (e.g., cardio, strength, flexibility) and durations.
- Return the entire response in **structured Markdown** format.

Example structure:
# Workout History Summary
[Write your summary here]

## Week 1:
- ...
## Week 2:
- ...
## Week 3:
- ...
## Week 4:
- ...

### Motivation Tips:
- ...
`;

    console.log("Calling OpenAI for plan generation...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const plan = completion.choices[0].message.content;
    res.json({ plan });
  } catch (err) {
    console.error("AI plan generation error:", err);
    res.status(500).json({ error: "Failed to generate AI fitness plan" });
  }
});


// ===== test server =====
app.get("/", (req, res) => {
  res.send("🏋️ Fitness Tracker Backend Running");
});

// ===== start server =====
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
