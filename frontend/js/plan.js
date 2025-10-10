const BASE_URL = "http://54.211.172.19:3000";

document.getElementById("generatePlanBtn").addEventListener("click", async () => {
    const uid = "68e6a330980e29458bb10a00";

    if (!uid) {
        alert("Please log in first!");
        window.location.href = "./login.html";
        return;
    }

    const loading = document.getElementById("loading");
    const planContainer = document.getElementById("planContainer");
    loading.style.display = "block";
    planContainer.innerHTML = "";

    try {
        // Get user input values
        const height = document.getElementById("height")?.value;
        const weight = document.getElementById("weight")?.value;
        const targetWeight = document.getElementById("targetWeight")?.value;
        const activity = document.getElementById("activity")?.value;

        // If any field is missing, show alert
        if (!height || !weight || !targetWeight || !activity) {
            loading.style.display = "none";
            alert("Please fill in all fields before generating your plan!");
            return;
        }

        // Fetch user workout records
        const res = await fetch(`${BASE_URL}/api/fitness/${uid}`);
        const records = await res.json();

        // If no records, allow plan generation using only inputs
        if (!records || records.length === 0) {
            console.warn("No workout records found, generating plan from inputs only.");
        }

        // Call backend AI endpoint
        const aiRes = await fetch(`${BASE_URL}/api/plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                uid,
                records,
                userInfo: {
                    height,
                    weight,
                    targetWeight,
                    activity,
                },
            }),
        });

        const data = await aiRes.json();
        loading.style.display = "none";

        // Generate the plan
        planContainer.innerHTML = `
        <div class="card shadow p-4 text-start" style="text-align: left;">
          <h4 class="text-success mb-3">🏆 Your AI Fitness Plan</h4>
          <div class="markdown-body" style="font-size: 1rem; line-height: 1.6; text-align: left;">
            ${marked.parse(data.plan)}
          </div>
        </div>
      `;


    } catch (err) {
        console.error("Error generating plan:", err);
        loading.style.display = "none";
        planContainer.innerHTML = `<div class="alert alert-danger">Failed to generate plan. Please try again later.</div>`;
    }
});
