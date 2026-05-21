async function profileApi(url, options = {}) {
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

async function uploadProfilePhoto(file) {
  const data = new FormData();
  data.append("file", file);
  const response = await fetch("/api/uploads/profile-photo", {
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

function profileStatus(message, type = "success") {
  const el = document.getElementById("profile-status");
  el.textContent = message;
  el.className = `status show ${type}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const profile = await profileApi("/api/profile/me");
    document.getElementById("profile-name").textContent = profile.name;
    document.getElementById("profile-email").textContent = profile.email;
    document.getElementById("profile-bio-display").textContent = profile.bio || "Add your founder story.";
    document.getElementById("profile-name-input").value = profile.name || "";
    document.getElementById("profile-bio-input").value = profile.bio || "";
    if (profile.profilePhoto) {
      document.getElementById("profile-avatar-image").src = profile.profilePhoto;
    }
    const followers = await profileApi(`/api/profile/${profile.id}/followers`);
    const following = await profileApi(`/api/profile/${profile.id}/following`);
    document.getElementById("followers-list").innerHTML = followers.map((user) => `<div class="person-card"><strong>${user.name}</strong><div class="muted">${user.email}</div></div>`).join("") || '<div class="empty-state">No followers yet.</div>';
    document.getElementById("following-list").innerHTML = following.map((user) => `<div class="person-card"><strong>${user.name}</strong><div class="muted">${user.email}</div></div>`).join("") || '<div class="empty-state">Not following anyone yet.</div>';
  } catch (_) {
    window.location.href = "/";
    return;
  }

  document.getElementById("profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      let profilePhoto;
      const file = document.getElementById("profile-photo-input").files[0];
      if (file) {
        profilePhoto = await uploadProfilePhoto(file);
      }
      await profileApi("/api/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          name: document.getElementById("profile-name-input").value,
          bio: document.getElementById("profile-bio-input").value,
          profilePhoto
        })
      });
      profileStatus("Profile updated");
      window.location.reload();
    } catch (error) {
      profileStatus(error.message, "error");
    }
  });
});
