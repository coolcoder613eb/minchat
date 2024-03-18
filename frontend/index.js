var username;
var socket;
// Get the input field
var input = document.getElementById("message-input");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("send-button").click();
  }
});
// Function to handle joining the chat
function joinChat() {
  // Prompt the user for their username
  username = prompt("Please enter your username:");
  if (username == null) {
    username = "Unknown";
  }

  // Connect to the WebSocket server
  socket = new WebSocket("ws://" + window.location.host + "/ws");

  // Event handler for when the WebSocket connection is opened
  socket.onopen = function (event) {
    console.log("WebSocket connection established.");

    // Send the username to the server as JSON
    var message = {
      username: "system",
      message: username + " joined.",
    };
    socket.send(JSON.stringify(message));
    let button = document.getElementById("send-button");

    button.removeEventListener("click", joinChat);
    button.addEventListener("click", sendMessage);
    button.innerText = "Send";
  };
  // Event handler for incoming messages from the server
  socket.onmessage = function (event) {
    var message = JSON.parse(event.data);
    console.log("Received message from server:", message);
    // Handle incoming messages from the server as needed
    let messages = document.getElementById("message-container");
    let msg = document.createElement("div");
    let uname = document.createElement("div");
    uname.setAttribute("class", "user name");
    uname.innerText = message.username;
    let text = document.createElement("div");
    text.innerText = message.message;
    let system = false;
    if (message.username == username) {
      msg.setAttribute("class", "message sent");
    } else if (message.username == "system") {
      msg.setAttribute("class", "message system");
      system = true;
    } else {
      msg.setAttribute("class", "message received");
    }
    if (!system) {
      msg.appendChild(uname);
    }
    msg.appendChild(text);
    messages.appendChild(msg);
    window.scrollTo(0, document.body.scrollHeight);
  };

  // Event handler for errors in the WebSocket connection
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    // Handle errors in the WebSocket connection
  };

  // Event handler for when the WebSocket connection is closed
  socket.onclose = function (event) {
    console.log("WebSocket connection closed.");
    // Handle the WebSocket connection being closed
  };
}

function sendMessage() {
  message = document.getElementById("message-input");
  socket.send(JSON.stringify({ username: username, message: message.value }));
  message.value = "";
}

// Add event listener to the "Join" button
document.getElementById("send-button").addEventListener("click", joinChat);
