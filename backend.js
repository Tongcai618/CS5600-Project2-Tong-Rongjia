// backend.js
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

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
