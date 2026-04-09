const SESSION_KEY = "cf_ai_session_id";

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chatForm");
const inputEl = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const sessionLabel = document.getElementById("sessionLabel");
const storedCountEl = document.getElementById("storedCount");
const archivedCountEl = document.getElementById("archivedCount");
const voiceBtn = document.getElementById("voiceBtn");
const inputModeEl = document.getElementById("inputMode");
const modelModeEl = document.getElementById("modelMode");
const briefBtn = document.getElementById("briefBtn");
const briefOutput = document.getElementById("briefOutput");
const radarBtn = document.getElementById("radarBtn");
const radarGoal = document.getElementById("radarGoal");
const radarOutput = document.getElementById("radarOutput");

const sessionId = localStorage.getItem(SESSION_KEY) || crypto.randomUUID();
localStorage.setItem(SESSION_KEY, sessionId);
sessionLabel.textContent = `Session: ${sessionId}`;

function bubble(role, text) {
  const node = document.createElement("article");
  node.className = `bubble ${role}`;
  node.textContent = text;
  messagesEl.appendChild(node);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function render(messages) {
  messagesEl.innerHTML = "";
  messages.forEach((msg) => {
    if (msg.role === "user" || msg.role === "assistant") {
      bubble(msg.role, msg.content);
    }
  });
  storedCountEl.textContent = String(messages.length);
}

async function loadHistory() {
  const res = await fetch(`/api/history?sessionId=${encodeURIComponent(sessionId)}`);
  if (!res.ok) {
    return;
  }
  const data = await res.json();
  render(data.messages || []);
  archivedCountEl.textContent = String(data.archivedCount || 0);
}

async function sendMessage(text) {
  sendBtn.disabled = true;
  bubble("user", text);

  const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ message: text })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    bubble("assistant", err.error || "Request failed. Please retry.");
    sendBtn.disabled = false;
    return;
  }

  const data = await res.json();
  bubble("assistant", data.response || "No response returned.");
  if (modelModeEl) {
    const source = data.source === "workers-ai" ? "Workers AI" : "Fallback";
    const model = data.model || "unknown";
    modelModeEl.textContent = `${source} (${model})`;
  }
  render(data.messages || []);
  sendBtn.disabled = false;
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) {
    return;
  }
  inputEl.value = "";
  await sendMessage(text);
});

clearBtn.addEventListener("click", async () => {
  await fetch(`/api/reset?sessionId=${encodeURIComponent(sessionId)}`, { method: "POST" });
  messagesEl.innerHTML = "";
  storedCountEl.textContent = "0";
  archivedCountEl.textContent = "0";
  if (briefOutput) {
    briefOutput.textContent = "No brief generated yet.";
  }
  if (radarOutput) {
    radarOutput.textContent = "No radar generated yet.";
  }
});

if (briefBtn) {
  briefBtn.addEventListener("click", async () => {
    briefBtn.disabled = true;
    briefBtn.textContent = "Generating...";

    const res = await fetch(`/api/brief?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "POST"
    });

    if (!res.ok) {
      if (briefOutput) {
        briefOutput.textContent = "Unable to generate brief yet. Send at least one message first.";
      }
      briefBtn.textContent = "Generate Mission Brief";
      briefBtn.disabled = false;
      return;
    }

    const data = await res.json();
    if (briefOutput) {
      const actions = Array.isArray(data.actions) ? data.actions.map((item) => `- ${item}`).join("\n") : "- None";
      const risks = Array.isArray(data.risks) ? data.risks.map((item) => `- ${item}`).join("\n") : "- None";
      briefOutput.textContent = [
        `Summary: ${data.summary || "N/A"}`,
        "",
        "Actions:",
        actions,
        "",
        "Risks:",
        risks,
        "",
        `Next Prompt: ${data.nextPrompt || "N/A"}`,
        `Source: ${data.source || "unknown"} (${data.model || "unknown"})`
      ].join("\n");
    }

    briefBtn.textContent = "Generate Mission Brief";
    briefBtn.disabled = false;
  });
}

if (radarBtn) {
  radarBtn.addEventListener("click", async () => {
    radarBtn.disabled = true;
    radarBtn.textContent = "Mapping...";

    const res = await fetch(`/api/radar?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ goal: radarGoal?.value || "" })
    });

    if (!res.ok) {
      if (radarOutput) {
        radarOutput.textContent = "Unable to generate radar yet. Send at least one message first.";
      }
      radarBtn.textContent = "Generate Opportunity Radar";
      radarBtn.disabled = false;
      return;
    }

    const data = await res.json();
    if (radarOutput) {
      const scope = Array.isArray(data.mvpScope) ? data.mvpScope.map((item) => `- ${item}`).join("\n") : "- None";
      const roadmap = Array.isArray(data.roadmap7d) ? data.roadmap7d.map((item) => `- ${item}`).join("\n") : "- None";
      radarOutput.textContent = [
        `Title: ${data.title || "N/A"}`,
        "",
        `Pitch: ${data.pitch || "N/A"}`,
        "",
        "MVP Scope:",
        scope,
        "",
        "7-Day Roadmap:",
        roadmap,
        "",
        `Moat: ${data.moat || "N/A"}`,
        `Source: ${data.source || "unknown"} (${data.model || "unknown"})`
      ].join("\n");
    }

    radarBtn.textContent = "Generate Opportunity Radar";
    radarBtn.disabled = false;
  });
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  voiceBtn.disabled = true;
  voiceBtn.textContent = "Voice Unavailable";
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    inputEl.value = transcript;
    inputModeEl.textContent = "Voice";
  });

  recognition.addEventListener("end", () => {
    voiceBtn.textContent = "Voice";
  });

  voiceBtn.addEventListener("click", () => {
    voiceBtn.textContent = "Listening...";
    recognition.start();
  });
}

loadHistory().catch(() => {
  bubble("assistant", "Unable to load history for this session.");
});
