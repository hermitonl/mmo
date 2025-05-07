const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, can be restricted later
    methods: ["GET", "POST"]
  }
});

const players = {}; // Simple in-memory store for player data

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  players[socket.id] = {
    id: socket.id,
    x: Math.floor(Math.random() * 700) + 50, // Random initial x
    y: Math.floor(Math.random() * 500) + 50, // Random initial y
    // Add other player properties here if needed, e.g., character sprite
  };

  // Send the current players object to the new player
  socket.emit('currentPlayers', players);

  // Announce the new player to other players
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    // Emit a message to all other clients to remove this player
    io.emit('playerDisconnected', socket.id);
  });

  // Listen for player movement
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      // Broadcast the movement to other players
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  // Add more game-specific event handlers here
  // e.g., for quiz interactions, chat messages, etc.
});

// Basic route for testing if the server is up (optional)
app.get('/api', (req, res) => {
  res.send('Hello from the API server!');
});

// Vercel will typically handle starting the server.
// For local development, you might add:
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = server; // Export the HTTP server instance for Vercel