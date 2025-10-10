import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

let registerDB;
let recordDB;

export async function connectDB(app) {
  const client = new MongoClient(uri);
  await client.connect();

  registerDB = client.db("fitness_register_db");
  recordDB = client.db("fitness_recording_db");

  console.log("Connected to MongoDB:");
  console.log(" - Register DB: fitness_register_db");
  console.log(" - Recording DB: fitness_recording_db");

  app.locals.registerDB = registerDB;
  app.locals.recordDB = recordDB;
}
