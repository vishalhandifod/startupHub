async function discoveryApi(url) {
  const response = await fetch(url, { credentials: "include" });
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

function renderSuggestions(users) {
  const container = document.getElementById("suggestions-list");
  container.innerHTML = users.length ? users.map((user) => `
    <div class="person-card">
      <strong>${user.name}</strong>
      <div class="muted">${user.email}</div>
      <div class="muted">${user.followerCount} followers</div>
    </div>
  `).join("") : '<div class="empty-state">No suggestions right now.</div>';
}

function renderSearchResults(users) {
  const container = document.getElementById("search-results");
  container.innerHTML = users.length ? users.map((user) => `
    <div class="person-card">
      <strong>${user.name}</strong>
      <div class="muted">${user.email}</div>
      <div class="muted">${user.followedByCurrentUser ? "Following" : "Not followed yet"}</div>
    </div>
  `).join("") : '<div class="empty-state">No matching people found.</div>';
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const suggestions = await discoveryApi("/api/discovery/suggestions");
    renderSuggestions(suggestions);
  } catch (_) {
    window.location.href = "/";
    return;
  }

  document.getElementById("search-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const q = document.getElementById("search-query").value.trim();
    if (!q) return;
    try {
      const results = await discoveryApi(`/api/discovery/search/users?q=${encodeURIComponent(q)}`);
      renderSearchResults(results);
    } catch (error) {
      document.getElementById("search-results").innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
  });
});
