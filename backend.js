// backend.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import workoutRoutes from "./routes/workout.js";
import aiPlanRoutes from "./routes/ai-plan.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ===== middleware =====
app.use(cors());
app.use(express.json());

// ===== Routes =====
app.use("/api", authRoutes);
app.use("/api", workoutRoutes);
app.use("/api", aiPlanRoutes);

// ===== Test route =====
app.get("/", (req, res) => {
  res.send("🏋️ Fitness Tracker Backend Running");
});

// ===== Start server =====
connectDB(app)
  .then(() => {
    app.listen(port, () =>
      console.log(`Server running at http://localhost:${port}`),
    );
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
