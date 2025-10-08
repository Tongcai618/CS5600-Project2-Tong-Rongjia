const BASE_URL = "http://54.211.172:3000";
document.addEventListener("DOMContentLoaded", async () => {
  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Please log in first!");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/fitness/${uid}`);
    const records = await response.json();

    console.log("Fetched records:", records);

    // render records
    const container = document.getElementById("workoutList");
    container.innerHTML = "";

    if (records.length === 0) {
      container.innerHTML = "<p>No workout records found.</p>";
    } else {
      records.forEach((rec) => {
        const div = document.createElement("div");
        div.classList.add("card", "mb-3", "p-2");
        div.innerHTML = `
          <strong>${rec.sport}</strong><br>
          Duration: ${rec.duration} min<br>
          Date: ${rec.date}<br>
          ${rec.description}
        `;
        container.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Error fetching records:", err);
  }
});
