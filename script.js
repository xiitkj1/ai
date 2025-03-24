document.addEventListener("DOMContentLoaded", () => {
  loadChatHistory();
  setupThemeToggle();
  setupUserInput();
});

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

function setupUserInput() {
  const userInput = document.getElementById("userInput");
  const sendButton = document.getElementById("sendButton");

  userInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
          event.preventDefault();
          sendMessage();
      }
  });

  sendButton.addEventListener("click", sendMessage);

  userInput.addEventListener("input", function () {
      const query = this.value.trim();
      if (query.length < 2) return hideSuggestions();

      fetch(`http://localhost:3000/suggestions?query=${query}`)
          .then(response => response.json())
          .then(data => showSuggestions(data))
          .catch(error => console.error("Error fetching suggestions:", error));
  });
}

function sendMessage() {
  const userInputElement = document.getElementById("userInput");
  const userText = userInputElement.value.trim();

  if (userText === "") return;

  addMessage(userText, "user");
  chatHistory.push({ role: "user", content: userText });
  saveChatHistory();

  userInputElement.value = "";
  showTypingIndicator();

  setTimeout(() => {
      fetch("http://localhost:3000/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history: chatHistory, question: userText }),
      })
      .then(response => response.json())
      .then(data => {
          removeTypingIndicator();
          addMessage(data.answer, "ai");
          chatHistory.push({ role: "ai", content: data.answer });
          saveChatHistory();
          playNotificationSound();
      })
      .catch(error => {
          removeTypingIndicator();
          addMessage("Terjadi kesalahan, coba lagi nanti.", "ai");
          console.error("Error fetching response:", error);
      });
  }, 1500);
}

function addMessage(message, sender) {
  const messagesContainer = document.getElementById("messages");
  const messageDiv = document.createElement("div");

  messageDiv.classList.add("chat-bubble", sender === "user" ? "user-message" : "ai-message");
  messageDiv.textContent = message;

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
  saveChatHistory();
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById("messages");
  let typingDiv = document.getElementById("typing-indicator");

  if (!typingDiv) {
      typingDiv = document.createElement("div");
      typingDiv.id = "typing-indicator";
      typingDiv.classList.add("chat-bubble", "ai-message", "typing-indicator");
      typingDiv.innerHTML = "AI sedang mengetik<span class='dots'>...</span>";

      messagesContainer.appendChild(typingDiv);
      scrollToBottom();
  }
}

function removeTypingIndicator() {
  const typingDiv = document.getElementById("typing-indicator");
  if (typingDiv) typingDiv.remove();
}

function scrollToBottom() {
  const messagesContainer = document.getElementById("messages");
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function saveChatHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function loadChatHistory() {
  const messagesContainer = document.getElementById("messages");
  messagesContainer.innerHTML = "";

  chatHistory.forEach(entry => {
      addMessage(entry.content, entry.role);
  });

  scrollToBottom();
}

const notificationSound = new Audio("notif.mp3");
function playNotificationSound() {
  notificationSound.play();
}

function showSuggestions(suggestions) {
  const suggestionsBox = document.getElementById("suggestions");
  suggestionsBox.innerHTML = "";

  if (suggestions.length === 0) return hideSuggestions();

  suggestions.forEach(suggestion => {
      const item = document.createElement("div");
      item.classList.add("suggestion-item");
      item.textContent = suggestion;
      item.onclick = () => {
          document.getElementById("userInput").value = suggestion;
          hideSuggestions();
      };
      suggestionsBox.appendChild(item);
  });

  suggestionsBox.style.display = "block";
}

function hideSuggestions() {
  document.getElementById("suggestions").style.display = "none";
}

function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const icon = themeToggle.querySelector(".icon");
  const currentTheme = localStorage.getItem("theme") || "dark";

  setTheme(currentTheme);

  themeToggle.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
      setTheme(newTheme);
  });

  function setTheme(theme) {
      document.body.classList.toggle("dark-mode", theme === "dark");
      document.body.classList.toggle("light-mode", theme === "light");

      // Ganti ikon berdasarkan tema
      icon.textContent = theme === "dark" ? "🌞" : "🌙";

      localStorage.setItem("theme", theme);
  }
}
