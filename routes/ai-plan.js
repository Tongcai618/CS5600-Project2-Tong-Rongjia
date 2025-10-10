import express from "express";
import OpenAI from "openai";

const router = express.Router();

router.post("/plan", async (req, res) => {
    try {
        const { records, userInfo } = req.body;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

        // 1. Build summary
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

        // 2. Profile
        const { height, weight, targetWeight, activity } = userInfo || {};
        const profileText = `
User Profile:
- Height: ${height || "N/A"} cm
- Current Weight: ${weight || "N/A"} kg
- Target Weight: ${targetWeight || "N/A"} kg
- Activity Level: ${activity || "N/A"}
`;

        // 3. Prompt
        const prompt = `
You are a certified personal trainer and fitness coach.

${profileText}

Here is this user's recent workout history:
${summary}

---

### Your Task:
1. Start with a **brief summary paragraph (2-4 sentences)** analyzing the workout history and overall fitness level.
   - Write it **in the second person ("you have")**.
2. Then create a **4-week personalized fitness plan** in **structured Markdown** format.

# Workout History Summary
...
## Week 1:
...
## Week 2:
...
## Week 3:
...
## Week 4:
...
### Motivation Tips:
...
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

export default router;
