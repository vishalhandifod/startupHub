const authState = {
  mode: "login"
};

function authStatus(message, type = "success") {
  const el = document.getElementById("auth-status");
  if (!el) return;
  el.textContent = message;
  el.className = `status show ${type}`;
}

function switchAuthMode(mode) {
  authState.mode = mode;
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });
  document.getElementById("register-name-field").classList.toggle("hidden", mode !== "register");
  document.getElementById("auth-submit").textContent = mode === "register" ? "Create Account" : "Sign In";
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : {};
  if (!response.ok) {
    throw new Error(body.message || "Request failed");
  }
  return body;
}

async function bootstrapAuthPage() {
  try {
    await requestJson("/api/auth/me");
    window.location.href = "/app/feed";
  } catch (_) {
    // Stay on landing page for unauthenticated users.
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrapAuthPage();
  switchAuthMode("login");

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => switchAuthMode(button.dataset.authMode));
  });

  document.getElementById("auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      email: document.getElementById("auth-email").value,
      password: document.getElementById("auth-password").value
    };

    let endpoint = "/api/auth/login";
    if (authState.mode === "register") {
      endpoint = "/api/auth/register";
      payload.name = document.getElementById("auth-name").value;
    }

    try {
      authStatus(authState.mode === "register" ? "Creating your account..." : "Signing you in...");
      await requestJson(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      window.location.href = "/app/feed";
    } catch (error) {
      authStatus(error.message, "error");
    }
  });
});
