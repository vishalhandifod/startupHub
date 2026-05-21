async function notificationsApi(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
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

function renderNotifications(items) {
  const container = document.getElementById("notifications-list");
  container.innerHTML = items.length ? items.map((item) => `
    <div class="notification-card">
      <div class="list-head">
        <strong>${item.actor.name}</strong>
        <span class="muted">${new Date(item.createdAt).toLocaleString()}</span>
      </div>
      <p>${item.message}</p>
      <button class="ghost-btn" data-read-id="${item.id}">${item.read ? "Read" : "Mark as read"}</button>
    </div>
  `).join("") : '<div class="empty-state">No notifications yet.</div>';

  container.querySelectorAll("[data-read-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await notificationsApi(`/api/notifications/${button.dataset.readId}/read`, { method: "PUT" });
      loadNotifications();
    });
  });
}

async function loadNotifications() {
  const notifications = await notificationsApi("/api/notifications");
  renderNotifications(notifications);
}

document.addEventListener("DOMContentLoaded", () => {
  loadNotifications().catch(() => {
    window.location.href = "/";
  });
});
