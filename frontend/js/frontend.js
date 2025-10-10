const BASE_URL = "http://54.211.172.19:3000";
// const BASE_URL = "http://localhost:3000"

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
