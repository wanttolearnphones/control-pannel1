<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ritter OS</title>
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    background: url('https://wallpapercave.com/wp/wp5128415.jpg') no-repeat center center/cover;
    height: 100vh;
    overflow: hidden;
  }

  /* Taskbar */
  .taskbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    padding: 0 10px;
    color: white;
  }

  .taskbar button {
    background: none;
    border: none;
    color: white;
    margin-right: 15px;
    font-size: 18px;
    cursor: pointer;
  }

  /* Search Window */
  #searchWindow {
    display: none;
    position: absolute;
    bottom: 60px;
    left: 20px;
    width: 300px;
    background: white;
    color: black;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    padding: 10px;
  }

  #searchInput {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  /* Messaging Window */
  #messagingApp {
    display: none;
    position: absolute;
    top: 20%;
    left: 30%;
    width: 400px;
    height: 300px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
  }

  #chatMessages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    border-bottom: 1px solid #ccc;
  }

  #chatInput {
    display: flex;
    padding: 8px;
  }

  #chatInput input {
    flex: 1;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  #chatInput button {
    margin-left: 6px;
    padding: 6px 10px;
    border: none;
    background: #0078D7;
    color: white;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
</head>
<body>

<!-- Taskbar -->
<div class="taskbar">
  <button onclick="toggleSearch()">🔍 Search</button>
  <button onclick="toggleMessaging()">💬 Messages</button>
</div>

<!-- Search Window -->
<div id="searchWindow">
  <input type="text" id="searchInput" placeholder="Search something..." onkeydown="if(event.key==='Enter'){doSearch()}">
  <div id="searchResults"></div>
</div>

<!-- Messaging App -->
<div id="messagingApp">
  <div id="chatMessages"></div>
  <div id="chatInput">
    <input type="text" id="messageText" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>
  </div>
</div>

<script>
  // Toggle Search
  function toggleSearch() {
    let searchWin = document.getElementById("searchWindow");
    searchWin.style.display = searchWin.style.display === "block" ? "none" : "block";
  }

  function doSearch() {
    let q = document.getElementById("searchInput").value;
    let results = document.getElementById("searchResults");
    results.innerHTML = `<p>Searching the web for: <b>${q}</b></p>
    <a href="https://www.google.com/search?q=${encodeURIComponent(q)}" target="_blank">Open Google Results</a>`;
  }

  // Toggle Messaging
  function toggleMessaging() {
    let msgApp = document.getElementById("messagingApp");
    msgApp.style.display = msgApp.style.display === "flex" ? "none" : "flex";
    loadMessages();
  }

  // Messaging Logic
  function sendMessage() {
    let text = document.getElementById("messageText").value;
    if (!text.trim()) return;
    let messages = JSON.parse(localStorage.getItem("ritterMessages") || "[]");
    messages.push({ text: text, time: new Date().toLocaleTimeString() });
    localStorage.setItem("ritterMessages", JSON.stringify(messages));
    document.getElementById("messageText").value = "";
    loadMessages();
  }

  function loadMessages() {
    let messages = JSON.parse(localStorage.getItem("ritterMessages") || "[]");
    let chat = document.getElementById("chatMessages");
    chat.innerHTML = messages.map(m => `<p><b>${m.time}:</b> ${m.text}</p>`).join("");
    chat.scrollTop = chat.scrollHeight;
  }
</script>

</body>
</html>