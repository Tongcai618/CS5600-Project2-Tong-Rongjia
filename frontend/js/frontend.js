const BASE_URL = "http://54.211.172.19:3000";

document.addEventListener("DOMContentLoaded", () => {
    // ---------- LOGIN ----------
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

      try {
        const response = await fetch(`${BASE_URL}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: username, password }),
        });

                const data = await response.json();

                if (response.ok) {
                    // Login successful
                    loginMessage.textContent = "Login successful! Redirecting...";
                    loginMessage.className = "mt-3 text-success text-center";

                    // save uid to localStorage (for fitness records)
                    localStorage.setItem("uid", data.userId);

                    // set a short delay before redirecting
                    setTimeout(() => {
                        window.location.href = "workout.html";
                    }, 1000);
                } else {
                    // login failed
                    loginMessage.textContent = data.error || "Invalid credentials.";
                    loginMessage.className = "mt-3 text-danger text-center";
                }
            } catch (err) {
                console.error("Login error:", err);
                loginMessage.textContent = "Server error, please try again later.";
                loginMessage.className = "mt-3 text-danger text-center";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // ---------- SIGNUP ----------
    const signupForm = document.getElementById("signupForm");
    const messageDiv = document.getElementById("message");

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Collect form data
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!name || !email || !password) {
            messageDiv.innerHTML = `<div class="alert alert-danger">Please fill in all fields</div>`;
            return;
        }

    try {
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

            const data = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `<div class="alert alert-success">${data.message || "Account created successfully!"}</div>`;
                signupForm.reset();

                // Optionally redirect after 1.5 seconds
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                messageDiv.innerHTML = `<div class="alert alert-danger">${data.message || "Registration failed."}</div>`;
            }
        } catch (err) {
            console.error("Error:", err);
            messageDiv.innerHTML = `<div class="alert alert-danger">Server error. Please try again later.</div>`;
        }
    });
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
                // Update existing workout
                workouts[editIndex] = newWorkout;
                message.innerHTML = `<div class="alert alert-success">Workout updated successfully!</div>`;
                editIndex = null; // reset
            } else {
                // Add new workout
                workouts.push(newWorkout);
                message.innerHTML = `<div class="alert alert-success">Workout saved!</div>`;
            }

            localStorage.setItem("workouts", JSON.stringify(workouts));
            workoutForm.reset();
            renderWorkouts();
        });
    }
});
