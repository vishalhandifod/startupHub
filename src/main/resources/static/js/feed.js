async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (response.status === 401) {
    window.location.href = "/";
    throw new Error("Authentication required");
  }
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body;
}

function showStatus(id, message, type = "success") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `status show ${type}`;
}

function renderPosts(posts) {
  const container = document.getElementById("feed-list");
  if (!container) return;
  if (!posts.length) {
    container.innerHTML = '<div class="empty-state">No posts yet. Share the first startup update.</div>';
    return;
  }

  container.innerHTML = posts.map((post) => `
    <article class="post-card">
      <div class="post-head">
        <div>
          <strong>${post.author.name}</strong>
          <div class="muted">${post.author.role} · ${new Date(post.createdAt).toLocaleString()}</div>
        </div>
        <button class="ghost-btn" data-like-post="${post.id}">${post.likedByCurrentUser ? "Liked" : "Like"}</button>
      </div>
      <p>${post.content}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post media">` : ""}
      <div class="inline-actions muted">
        <span>${post.likeCount} likes</span>
        <span>${post.commentCount} comments</span>
      </div>
    </article>
  `).join("");

  container.querySelectorAll("[data-like-post]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/api/posts/${button.dataset.likePost}/likes`, { method: "POST" });
        await loadFeed();
      } catch (error) {
        showStatus("composer-status", error.message, "error");
      }
    });
  });
}

async function uploadPostImage(file) {
  const data = new FormData();
  data.append("file", file);
  const response = await fetch("/api/uploads/post-image", {
    method: "POST",
    body: data,
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || "Upload failed");
  }
  return body.path;
}

async function loadFeed() {
  const [feed, me, notifications] = await Promise.all([
    api("/api/posts"),
    api("/api/auth/me"),
    api("/api/notifications")
  ]);
  document.getElementById("welcome-name").textContent = me.name;
  document.getElementById("metric-posts").textContent = feed.length;
  document.getElementById("metric-notifications").textContent = notifications.length;
  renderPosts(feed);
}

document.addEventListener("DOMContentLoaded", () => {
  const mediaInput = document.getElementById("post-image");
  const preview = document.getElementById("post-image-preview");

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await api("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  });

  mediaInput.addEventListener("change", () => {
    const [file] = mediaInput.files;
    if (!file) {
      preview.style.display = "none";
      return;
    }
    preview.src = URL.createObjectURL(file);
    preview.parentElement.style.display = "block";
  });

  document.getElementById("composer-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      let imageUrl = null;
      if (mediaInput.files[0]) {
        imageUrl = await uploadPostImage(mediaInput.files[0]);
      }
      await api("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          content: document.getElementById("post-content").value,
          imageUrl
        })
      });
      event.target.reset();
      preview.parentElement.style.display = "none";
      showStatus("composer-status", "Post published");
      await loadFeed();
    } catch (error) {
      showStatus("composer-status", error.message, "error");
    }
  });

  loadFeed().catch((error) => showStatus("composer-status", error.message, "error"));
});
