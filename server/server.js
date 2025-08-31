const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your client's URL
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], master: socket.id, state: { isPlaying: false, currentTime: 0, currentSong: 'your-song.mp3' } };
    }
    rooms[roomId].users.push(socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Send the current room state to the newly joined user
    socket.emit('roomState', rooms[roomId].state);
  });

  socket.on('play', (roomId) => {
    if (socket.id === rooms[roomId].master) {
      rooms[roomId].state.isPlaying = true;
      rooms[roomId].state.currentTime = Date.now(); // A simple timestamp to sync
      io.to(roomId).emit('sync-play', rooms[roomId].state);
      console.log(`Play command sent to room ${roomId}`);
    }
  });

  socket.on('pause', (roomId, currentTime) => {
    if (socket.id === rooms[roomId].master) {
      rooms[roomId].state.isPlaying = false;
      rooms[roomId].state.currentTime = currentTime; // Save paused time
      io.to(roomId).emit('sync-pause', rooms[roomId].state);
      console.log(`Pause command sent to room ${roomId}`);
    }
  });

  socket.on('seek', (roomId, currentTime) => {
    if (socket.id === rooms[roomId].master) {
      rooms[roomId].state.currentTime = currentTime;
      io.to(roomId).emit('sync-seek', rooms[roomId].state);
      console.log(`Seek command sent to room ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      const index = rooms[roomId].users.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].users.splice(index, 1);
        if (rooms[roomId].users.length === 0) {
          delete rooms[roomId]; // Clean up empty rooms
        } else if (rooms[roomId].master === socket.id) {
          // Assign a new master if the current one leaves
          rooms[roomId].master = rooms[roomId].users[0];
          console.log(`New master for room ${roomId} is ${rooms[roomId].master}`);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});