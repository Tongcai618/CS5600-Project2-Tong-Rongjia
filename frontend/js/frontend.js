// Generate mock data if localStorage is empty
if (!localStorage.getItem("workouts")) {
    const mockWorkouts = [
        {
            sport: "Running",
            duration: 45,
            dateTime: "2025-10-05T07:30",
            description: "Morning jog around the park"
        },
        {
            sport: "Yoga",
            duration: 30,
            dateTime: "2025-10-04T20:00",
            description: "Evening relaxation session"
        },
        {
            sport: "Cycling",
            duration: 60,
            dateTime: "2025-10-03T09:15",
            description: "Weekend ride with friends"
        },
        {
            sport: "Swimming",
            duration: 50,
            dateTime: "2025-10-01T14:00",
            description: "Lap practice at the gym"
        }
    ];
    localStorage.setItem("workouts", JSON.stringify(mockWorkouts));
    console.log("✅ Mock workout data created!");
}



document.addEventListener("DOMContentLoaded", () => {
    // ---------- SIGNUP ----------
    const signupForm = document.getElementById("signupForm");
    const signupMsg = document.getElementById("message");

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const res = await fetch("http://localhost:3000/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });
                const data = await res.json();

                if (res.ok) {
                    signupMsg.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                    setTimeout(() => (window.location.href = "/login.html"), 1500);
                } else {
                    signupMsg.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                }
            } catch (err) {
                signupMsg.innerHTML = `<div class="alert alert-danger">Server error</div>`;
            }
        });
    }

    // ---------- LOGIN ----------
    const loginForm = document.getElementById("loginForm");
    const loginMsg = document.getElementById("loginMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            try {
                const res = await fetch("http://localhost:3000/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });
                const data = await res.json();

                if (res.ok) {
                    loginMsg.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                    localStorage.setItem("token", data.token); // store JWT
                    setTimeout(() => (window.location.href = "/index.html"), 1500);
                } else {
                    loginMsg.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
                }
            } catch (err) {
                loginMsg.innerHTML = `<div class="alert alert-danger">Server error</div>`;
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // ---------- WORKOUT ----------
    const workoutForm = document.getElementById("workoutForm");
    const message = document.getElementById("message");
    const workoutTable = document.getElementById("workoutTable");

    let workouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    let editIndex = null; // track which item is being edited

    const renderWorkouts = () => {
        workoutTable.innerHTML = "";
        workouts.forEach((w, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
          <td>${w.sport}</td>
          <td>${w.duration}</td>
          <td>${new Date(w.dateTime).toLocaleString()}</td>
          <td>${w.description || "-"}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" onclick="editWorkout(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteWorkout(${index})">Delete</button>
          </td>
        `;
            workoutTable.appendChild(row);
        });
    };

    // Make functions global for button access
    window.editWorkout = (index) => {
        const w = workouts[index];
        document.getElementById("sport").value = w.sport;
        document.getElementById("duration").value = w.duration;
        document.getElementById("dateTime").value = w.dateTime;
        document.getElementById("description").value = w.description || "";
        editIndex = index;
        message.innerHTML = `<div class="alert alert-info">Editing record #${index + 1}</div>`;
    };

    window.deleteWorkout = (index) => {
        if (confirm("Are you sure you want to delete this record?")) {
            workouts.splice(index, 1);
            localStorage.setItem("workouts", JSON.stringify(workouts));
            renderWorkouts();
            message.innerHTML = `<div class="alert alert-warning">Workout deleted</div>`;
        }
    };

    renderWorkouts();

    if (workoutForm) {
        workoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const sport = document.getElementById("sport").value.trim();
            const duration = document.getElementById("duration").value.trim();
            const dateTime = document.getElementById("dateTime").value;
            const description = document.getElementById("description").value.trim();

            if (!sport || !duration || !dateTime) {
                message.innerHTML = `<div class="alert alert-danger">Please fill in all required fields</div>`;
                return;
            }

            const newWorkout = { sport, duration, dateTime, description };

            if (editIndex !== null) {
                // 🟢 Update existing workout
                workouts[editIndex] = newWorkout;
                message.innerHTML = `<div class="alert alert-success">Workout updated successfully!</div>`;
                editIndex = null; // reset
            } else {
                // 🟢 Add new workout
                workouts.push(newWorkout);
                message.innerHTML = `<div class="alert alert-success">Workout saved!</div>`;
            }

            localStorage.setItem("workouts", JSON.stringify(workouts));
            workoutForm.reset();
            renderWorkouts();
        });
    }
});
