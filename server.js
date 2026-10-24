require('dotenv').config();
const axios = require('axios');
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const mongoose = require('mongoose');

const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB error:', err));

// Room Model
const roomSchema = new mongoose.Schema({
    roomId: String,
    code: String,
    updatedAt: Date,
});

const Room = mongoose.model('Room', roomSchema);

// SECTION B - Track who's in which room
const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => ({
            socketId,
            username: userSocketMap[socketId],
        })
    );
}
const LANGUAGE_IDS = {
    javascript: 102,
    python: 100,
    cpp: 105,
    java: 62,
};
// SECTION C - Handle Socket Events
io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);

    socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);

        // Fetch existing code from MongoDB
        const room = await Room.findOne({ roomId });
        const existingCode = room?.code || '';

        // Send existing code to the new joiner
        io.to(socket.id).emit(ACTIONS.CODE_CHANGE, {
            code: existingCode,
        });

        // Notify everyone in the room
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, async ({ roomId, code }) => {
        // Broadcast to everyone else in the room
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });

        // Save to MongoDB
        await Room.findOneAndUpdate(
            { roomId },
            { code, updatedAt: new Date() },
            { upsert: true }
        );
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });
    socket.on(ACTIONS.RUN_CODE, async ({ roomId, code, language }) => {
    console.log('RUN_CODE received:', language);

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
        io.to(roomId).emit(ACTIONS.OUTPUT_RECEIVED, {
            error: 'Unsupported language',
        });
        return;
    }

    try {
        const response = await axios.post(
            'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
            { source_code: code, language_id: languageId },
            { timeout: 20000 }
        );
        const r = response.data;
        console.log('Judge0 replied:', r.status?.description);

        io.to(roomId).emit(ACTIONS.OUTPUT_RECEIVED, {
            stdout: r.stdout,
            stderr: r.stderr,
            compileOutput: r.compile_output,
            status: r.status?.description,
            time: r.time,
            memory: r.memory,
        });
    } catch (err) {
        console.log('Judge0 error:', err.message);
        io.to(roomId).emit(ACTIONS.OUTPUT_RECEIVED, {
            error: 'Could not reach the code execution service: ' + err.message,
        });
    }
});
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

// SECTION D - Start The Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));