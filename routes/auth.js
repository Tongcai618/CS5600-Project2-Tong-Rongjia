import express from "express";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const users = req.app.locals.registerDB.collection("users");

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
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const users = req.app.locals.registerDB.collection("users");
    const user = await users.findOne({ email });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found." });

    if (user.password !== password)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password." });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      userId: user._id,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

export default router;
