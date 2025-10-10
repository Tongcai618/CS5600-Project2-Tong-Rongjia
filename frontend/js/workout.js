// const BASE_URL = "http://54.211.172.19:3000";
// const BASE_URL = "http://localhost:3000"
const BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", async () => {
  const workoutForm = document.getElementById("workoutForm");
  const message = document.getElementById("message");
  const workoutTable = document.getElementById("workoutTable");

  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  let workouts = [];
  let editIndex = null;

  // ---------- Fetch workouts from backend ----------
  async function loadWorkouts() {
    try {
      const res = await fetch(`${BASE_URL}/api/fitness/${uid}`);
      if (!res.ok) throw new Error("Failed to load workouts");
      workouts = await res.json();
      renderWorkouts();
      console.log("Workouts loaded:", workouts);
    } catch (err) {
      console.error("Error loading workouts:", err);
      message.innerHTML = `<div class="alert alert-danger">Failed to load workouts from server.</div>`;
    }
  }

  // ---------- Render table ----------
  function renderWorkouts() {
    workoutTable.innerHTML = "";
    workouts.forEach((w, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${w.sportType}</td>
        <td>${w.duration}</td>
        <td>${new Date(w.date).toLocaleString()}</td>
        <td>${w.description || "-"}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editWorkout(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteWorkout(${index})">Delete</button>
        </td>
      `;
      workoutTable.appendChild(row);
    });
  }

  // ---------- Add / Update ----------
  if (workoutForm) {
    workoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Repair1: "sport"
      const sportType = document.getElementById("sport").value.trim();
      const duration = document.getElementById("duration").value.trim();

      // Repair2:  "dateTime"
      const dateTimeValue = document.getElementById("dateTime").value;
      if (!dateTimeValue) {
        message.innerHTML = `<div class="alert alert-danger">Please select date and time</div>`;
        return;
      }
      const date = new Date(dateTimeValue).toISOString();

      const description = document.getElementById("description").value.trim();

      if (!sportType || !duration || !date) {
        message.innerHTML = `<div class="alert alert-danger">Please fill in all required fields</div>`;
        return;
      }

      const newWorkout = { sportType, duration, date, description, uid };
      console.log("Submitting workout:", newWorkout);

      try {
        let res;
        if (editIndex !== null) {
          // Update existing record
          const id = workouts[editIndex]._id;
          res = await fetch(`${BASE_URL}/api/fitness/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newWorkout),
          });
        } else {
          // Create new record
          res = await fetch(`${BASE_URL}/api/fitness`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newWorkout),
          });
        }

        // Repair3: detailed error handling
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error:", errorData);
          throw new Error(errorData.error || "Server error");
        }

        message.innerHTML = `<div class="alert alert-success">Workout saved successfully!</div>`;
        workoutForm.reset();
        editIndex = null;
        await loadWorkouts(); // reload from DB
      } catch (err) {
        console.error("Save workout error:", err);
        message.innerHTML = `<div class="alert alert-danger">Failed to save workout: ${err.message}</div>`;
      }
    });
  }

  // ---------- Edit ----------
  window.editWorkout = (index) => {
    const w = workouts[index];

    // Repair4: Use the correct form fields ID
    const sportField = document.getElementById("sport");
    const durationField = document.getElementById("duration");
    const dateTimeField = document.getElementById("dateTime");
    const descriptionField = document.getElementById("description");

    //Check if field exists
    if (!sportField || !durationField || !dateTimeField || !descriptionField) {
      console.error("Form fields not found. Check your HTML IDs.");
      message.innerHTML = `<div class="alert alert-danger">Error: Form fields not found</div>`;
      return;
    }

    sportField.value = w.sportType;
    durationField.value = w.duration;

    // Repair5: Properly format datetime-local input
    const dateObj = new Date(w.date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    dateTimeField.value = `${year}-${month}-${day}T${hours}:${minutes}`;

    descriptionField.value = w.description || "";
    editIndex = index;

    message.innerHTML = `<div class="alert alert-info">Editing record #${index + 1}</div>`;
  };

  // ---------- Delete ----------
  window.deleteWorkout = async (index) => {
    const id = workouts[index]._id;
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const res = await fetch(`${BASE_URL}/api/fitness/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
        message.innerHTML = `<div class="alert alert-warning">Workout deleted</div>`;
        await loadWorkouts();
      } catch (err) {
        console.error("Delete error:", err);
        message.innerHTML = `<div class="alert alert-danger">Failed to delete workout.</div>`;
      }
    }
  };

  // ---------- Initialize ----------
  await loadWorkouts();
});
