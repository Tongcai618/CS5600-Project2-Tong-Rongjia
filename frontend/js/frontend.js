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
  