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

    // Load saved workouts (from localStorage for demo)
    const workouts = JSON.parse(localStorage.getItem("workouts") || "[]");

    const renderWorkouts = () => {
        workoutTable.innerHTML = "";
        workouts.forEach((w) => {
            const row = document.createElement("tr");
            row.innerHTML = `
          <td>${w.sport}</td>
          <td>${w.duration}</td>
          <td>${new Date(w.dateTime).toLocaleString()}</td>
          <td>${w.description || "-"}</td>
        `;
            workoutTable.appendChild(row);
        });
    };

    renderWorkouts();

    // Handle form submission
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
            workouts.push(newWorkout);
            localStorage.setItem("workouts", JSON.stringify(workouts));

            message.innerHTML = `<div class="alert alert-success">Workout saved!</div>`;
            workoutForm.reset();
            renderWorkouts();
        });
    }
});
