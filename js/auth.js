const API_BASE = "https://v2.api.noroff.dev";

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#auth-message");

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = `auth-message ${type}`;
}

function markInvalid(input, invalid) {
  input.setAttribute("aria-invalid", String(invalid));
}

function clearErrors(form) {
  showMessage("", "error");

  form.querySelectorAll("input").forEach((input) => {
    markInvalid(input, false);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendAuthRequest(endpoint, details) {
  let response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(details)
    });
  } catch {
    throw new Error(
      "Could not connect to Noroff. Check your internet connection."
    );
  }

  const result = await response.json();

  if (!response.ok) {
    const apiMessage =
      result.errors?.[0]?.message ||
      result.message ||
      "Something went wrong. Please try again.";

    throw new Error(apiMessage);
  }

  return result.data;
}

// LOGIN

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(loginForm);

    const emailInput = document.querySelector("#login-email");
    const passwordInput = document.querySelector("#login-password");
    const submitButton = loginForm.querySelector("button[type='submit']");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let valid = true;

    if (!isValidEmail(email)) {
      markInvalid(emailInput, true);
      valid = false;
    }

    if (!password) {
      markInvalid(passwordInput, true);
      valid = false;
    }

    if (!valid) {
      showMessage("Enter a valid email address and password.");
      return;
    }

    submitButton.disabled = true;
    showMessage("Logging in...", "success");

    try {
      const user = await sendAuthRequest("/auth/login", {
        email,
        password
      });

      if (!user?.accessToken) {
        throw new Error("Login succeeded, but no access token was returned.");
      }

      localStorage.setItem("nova_token", user.accessToken);
      localStorage.setItem(
        "nova_user",
        JSON.stringify({
          name: user.name,
          email: user.email
        })
      );

      showMessage("Login successful! Redirecting...", "success");

      window.location.href = "../index.html";
    } catch (error) {
      showMessage(error.message);
    } finally {
      submitButton.disabled = false;
    }
  });
}

// REGISTRATION

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(registerForm);

    const nameInput = document.querySelector("#register-name");
    const emailInput = document.querySelector("#register-email");
    const passwordInput = document.querySelector("#register-password");
    const confirmInput = document.querySelector("#register-confirm");
    const submitButton = registerForm.querySelector("button[type='submit']");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    let valid = true;

    // Noroff names can use letters, numbers and underscores.
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      markInvalid(nameInput, true);
      valid = false;
    }

    if (!isValidEmail(email)) {
      markInvalid(emailInput, true);
      valid = false;
    }

    if (password.length < 8) {
      markInvalid(passwordInput, true);
      valid = false;
    }

    if (password !== confirmPassword) {
      markInvalid(confirmInput, true);
      valid = false;
    }

    if (!valid) {
      showMessage(
        "Check your username, email, password and password confirmation."
      );
      return;
    }

    submitButton.disabled = true;
    showMessage("Creating your account...", "success");

    try {
      await sendAuthRequest("/auth/register", {
        name,
        email,
        password
      });

      showMessage(
        "Account created! Redirecting to login...",
        "success"
      );

      window.location.href = "./login.html";
    } catch (error) {
      showMessage(error.message);
    } finally {
      submitButton.disabled = false;
    }
  });
}