const BASE_URL = "http://localhost:3000";

document.getElementById("generatePlanBtn").addEventListener("click", async () => {
    const uid = localStorage.getItem("uid");

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
        // Fetch user workout records
        const res = await fetch(`${BASE_URL}/api/fitness/${uid}`);
        console.log(res);
        const records = await res.json();

        if (records.length === 0) {
            planContainer.innerHTML = `<div class="alert alert-info">No workout records found. Add some workouts first!</div>`;
            loading.style.display = "none";
            return;
        }

        // Call backend OpenAI API to generate plan
        const aiRes = await fetch(`${BASE_URL}/api/plan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ records }),
        });

        const data = await aiRes.json();
        loading.style.display = "none";

        // 3️⃣ Render AI-generated plan
        planContainer.innerHTML = `
      <div class="card shadow p-4">
        <h4 class="text-success mb-3">🏆 Your AI Fitness Plan</h4>
        <pre style="white-space: pre-wrap; font-size: 1rem;">${data.plan}</pre>
      </div>
    `;
    } catch (err) {
        console.error("Error generating plan:", err);
        loading.style.display = "none";
        planContainer.innerHTML = `<div class="alert alert-danger">Failed to generate plan. Please try again later.</div>`;
    }
});
