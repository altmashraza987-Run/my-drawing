
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const message = document.getElementById("message");

function showMessage(text, type) {
  message.textContent = text;
  message.className = "message " + type;
}

togglePassword.addEventListener("click", function () {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "Hide" : "Show";
});

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters.", "error");
    return;
  }

  // Open the drawing page
  window.location.href = "drawing.html";
});

document.getElementById("guestButton").addEventListener("click", function () {
  window.location.href = "drawing.html";
});

document.getElementById("forgotLink").addEventListener("click", function (event) {
  event.preventDefault();
  showMessage("Password reset is not connected yet.", "error");
});

document.getElementById("signupLink").addEventListener("click", function (event) {
  event.preventDefault();
  showMessage("Registration is not connected yet.", "error");
});
