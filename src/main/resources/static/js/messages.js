let activeConversationUserId = null;
let activeConversationName = "Choose a conversation";
let messagePollHandle = null;

async function messagesApi(url, options = {}) {
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

function showMessagesStatus(message, type = "success") {
  const el = document.getElementById("messages-status");
  if (!el) return;
  el.textContent = message;
  el.className = `status show ${type}`;
}

function renderConversationList(conversations) {
  const container = document.getElementById("conversation-list");
  if (!conversations.length) {
    container.innerHTML = '<div class="empty-state">No messages yet. Start the first conversation.</div>';
    return;
  }

  container.innerHTML = conversations.map((conversation) => `
    <button class="conversation-item ${activeConversationUserId === conversation.otherParticipant.id ? "active" : ""}" data-user-id="${conversation.otherParticipant.id}" data-name="${conversation.otherParticipant.name}">
      <div class="list-head">
        <strong>${conversation.otherParticipant.name}</strong>
        <span class="muted">${conversation.unreadCount} unread</span>
      </div>
      <div class="muted">${conversation.lastMessagePreview || "No messages yet"}</div>
    </button>
  `).join("");

  container.querySelectorAll(".conversation-item").forEach((button) => {
    button.addEventListener("click", async () => {
      activeConversationUserId = Number(button.dataset.userId);
      activeConversationName = button.dataset.name;
      await loadMessagesThread();
      await loadConversationSummaries();
    });
  });
}

function renderThread(messages) {
  const container = document.getElementById("message-thread");
  document.getElementById("active-conversation-name").textContent = activeConversationName;

  if (!messages.length) {
    container.innerHTML = '<div class="empty-state">No messages in this thread yet.</div>';
    return;
  }

  container.innerHTML = messages.map((message) => `
    <article class="message-bubble ${message.sender.email === document.body.dataset.currentUserEmail ? "sent" : "received"}">
      <div class="list-head">
        <strong>${message.sender.name}</strong>
        <span class="muted">${new Date(message.createdAt).toLocaleString()}</span>
      </div>
      <p>${message.content}</p>
    </article>
  `).join("");
  container.scrollTop = container.scrollHeight;
}

async function loadConversationSummaries() {
  const conversations = await messagesApi("/api/messages/conversations");
  renderConversationList(conversations);
}

async function loadMessagesThread() {
  if (!activeConversationUserId) return;
  const messages = await messagesApi(`/api/messages/conversations/${activeConversationUserId}`);
  renderThread(messages);
}

function startPolling() {
  if (messagePollHandle) {
    clearInterval(messagePollHandle);
  }
  messagePollHandle = setInterval(async () => {
    try {
      await loadConversationSummaries();
      if (activeConversationUserId) {
        await loadMessagesThread();
      }
    } catch (_) {
      clearInterval(messagePollHandle);
    }
  }, 10000);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const me = await messagesApi("/api/auth/me");
    document.body.dataset.currentUserEmail = me.email;
    await loadConversationSummaries();
    startPolling();
  } catch (_) {
    window.location.href = "/";
    return;
  }

  document.getElementById("open-conversation-btn").addEventListener("click", async () => {
    const value = document.getElementById("message-user-id").value.trim();
    if (!value) {
      showMessagesStatus("Enter a user id to open a conversation", "error");
      return;
    }
    activeConversationUserId = Number(value);
    activeConversationName = `Conversation with user ${value}`;
    try {
      await loadMessagesThread();
      await loadConversationSummaries();
    } catch (error) {
      showMessagesStatus(error.message, "error");
    }
  });

  document.getElementById("message-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!activeConversationUserId) {
      showMessagesStatus("Open a conversation first", "error");
      return;
    }
    try {
      await messagesApi("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: activeConversationUserId,
          content: document.getElementById("message-content").value
        })
      });
      document.getElementById("message-content").value = "";
      showMessagesStatus("Message sent");
      await loadMessagesThread();
      await loadConversationSummaries();
    } catch (error) {
      showMessagesStatus(error.message, "error");
    }
  });
});
