import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Create
router.post("/fitness", async (req, res) => {
  try {
    const { uid, sportType, duration, date, description } = req.body;
    if (!uid || !sportType || !duration || !date)
      return res.status(400).json({ error: "Missing required fields" });

    const records = req.app.locals.recordDB.collection("fitness_records");

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
router.get("/fitness/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const records = req.app.locals.recordDB.collection("fitness_records");

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
router.put("/fitness/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sportType, duration, date, description } = req.body;

    const records = req.app.locals.recordDB.collection("fitness_records");
    const result = await records.updateOne(
      { _id: new ObjectId(id) },
      { $set: { sportType, duration, date: new Date(date), description } }
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
router.delete("/fitness/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const records = req.app.locals.recordDB.collection("fitness_records");

    const result = await records.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Record deleted", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Delete record error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
