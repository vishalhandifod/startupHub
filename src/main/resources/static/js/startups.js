async function startupsApi(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (response.status === 401) {
    window.location.href = "/";
    throw new Error("Authentication required");
  }
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Request failed");
  }
  return body;
}

async function uploadStartupLogo(file) {
  const data = new FormData();
  data.append("file", file);
  const response = await fetch("/api/uploads/startup-logo", {
    method: "POST",
    credentials: "include",
    body: data
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Upload failed");
  }
  return body.path;
}

function startupStatus(message, type = "success") {
  const el = document.getElementById("startup-status");
  if (!el) return;
  el.textContent = message;
  el.className = `status show ${type}`;
}

function renderStartupCards(startups) {
  const container = document.getElementById("startup-list");
  container.innerHTML = startups.length ? startups.map((startup) => `
    <a class="startup-card" href="/app/startups/${startup.id}">
      <strong>${startup.name}</strong>
      <div class="muted">${startup.industry || "Startup"}</div>
      <div class="muted">${startup.location || "Location pending"}</div>
      <div class="muted">${startup.followerCount} followers</div>
    </a>
  `).join("") : '<div class="empty-state">No startups launched yet.</div>';
}

async function initStartupsPage() {
  const startups = await startupsApi("/api/startups");
  renderStartupCards(startups);

  document.getElementById("startup-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      let logoUrl = null;
      const file = document.getElementById("startup-logo-input").files[0];
      if (file) {
        logoUrl = await uploadStartupLogo(file);
      }
      await startupsApi("/api/startups", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("startup-name-input").value,
          slug: document.getElementById("startup-slug-input").value,
          description: document.getElementById("startup-description-input").value,
          logoUrl,
          website: document.getElementById("startup-website-input").value,
          industry: document.getElementById("startup-industry-input").value,
          location: document.getElementById("startup-location-input").value
        })
      });
      startupStatus("Startup created");
      event.target.reset();
      renderStartupCards(await startupsApi("/api/startups"));
    } catch (error) {
      startupStatus(error.message, "error");
    }
  });
}

async function initStartupDetailPage() {
  const startupId = document.getElementById("startup-detail-root").dataset.startupId;
  const startup = await startupsApi(`/api/startups/${startupId}`);
  document.getElementById("startup-name").textContent = startup.name;
  document.getElementById("startup-slug").textContent = `@${startup.slug}`;
  document.getElementById("startup-description").textContent = startup.description || "No startup story added yet.";
  document.getElementById("startup-meta").textContent = `${startup.industry || "Startup"} · ${startup.location || "Location pending"}`;
  document.getElementById("startup-followers").textContent = `${startup.followerCount} followers`;
  if (startup.logoUrl) {
    document.getElementById("startup-logo").src = startup.logoUrl;
  }

  document.getElementById("follow-startup-btn").addEventListener("click", async () => {
    try {
      const updated = await startupsApi(`/api/startups/${startupId}/follow`, { method: "POST" });
      document.getElementById("startup-followers").textContent = `${updated.followerCount} followers`;
      startupStatus("Following startup");
    } catch (error) {
      startupStatus(error.message, "error");
    }
  });

  document.getElementById("startup-edit-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      let logoUrl;
      const file = document.getElementById("startup-detail-logo-input").files[0];
      if (file) {
        logoUrl = await uploadStartupLogo(file);
      }
      await startupsApi(`/api/startups/${startupId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: document.getElementById("startup-detail-name-input").value || undefined,
          description: document.getElementById("startup-detail-description-input").value || undefined,
          logoUrl,
          website: document.getElementById("startup-detail-website-input").value || undefined,
          industry: document.getElementById("startup-detail-industry-input").value || undefined,
          location: document.getElementById("startup-detail-location-input").value || undefined
        })
      });
      startupStatus("Startup updated");
      window.location.reload();
    } catch (error) {
      startupStatus(error.message, "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("startup-list")) {
    initStartupsPage().catch((error) => startupStatus(error.message, "error"));
  }
  if (document.getElementById("startup-detail-root")) {
    initStartupDetailPage().catch((error) => startupStatus(error.message, "error"));
  }
});
