const socket = io();
const form = document.getElementById('chat-form');
const input = document.getElementById('m');
const messages = document.getElementById('messages');

let currentUsername = null;

// Fetch the logged in username first
fetch('/User')
    .then(res => res.json())
    .then(data => {
        currentUsername = data.username;
    })
    .catch(() => {
        alert("Failed to load user info");
    });

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value.trim() && currentUsername) {
        socket.emit('chat message', {
            username: currentUsername,
            message: input.value
        });
        input.value = '';
    }
});

socket.on('chat message', function (data) {
    const item = document.createElement('div');
    item.innerHTML = `<strong>${data.username}</strong>: ${data.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});