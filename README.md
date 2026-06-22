#CODE TOGETHE
Code Together is a modern, real-time collaborative code editor designed to make pair programming, remote debugging, and collaborative coding seamless. Built with React, Node.js, and Socket.io, it allows multiple users to edit the same codebase in real-time with low latency.

# Key Features
Real-Time Syncing: Instant code synchronization across all connected clients in a shared room.

Collaborative Environment: See who is online in your room with live user presence tracking.

Modern Dark Mode: A sleek, developer-focused interface for long coding sessions.

Easy Room Management: Create unique rooms and invite peers with a single Room ID.

Low Latency: Optimized WebSocket communication powered by Socket.io.

# Tech Stack
Frontend: React, CodeMirror (for the code editor), CSS3

Backend: Node.js, Express

Communication: Socket.io (for real-time event-driven data transfer)

# Getting Started
Prerequisites
Node.js installed on your machine.

An active internet connection.

# Installation
1.Clone the repository:

Bash
git clone https://github.com/yourusername/code-together.git
cd code-together

2.Install dependencies:

Bash
npm install

3.Setup Environment Variables:
Create a .env file in the root directory:

Plaintext
REACT_APP_BACKEND_URL=http://localhost:5000

# Running the App
You will need two terminal windows:

Terminal 1 (Backend):

Bash
npm run server:dev

Terminal 2 (Frontend):

Bash
npm run start:front
The application will automatically open at http://localhost:3000.

# Future Roadmap
[ ] Add Language Selector (C++, Python, Java)

[ ] Implement Secure Code Execution (Piston API Integration)

[ ] Add Persistent Storage (MongoDB) to save code sessions

Built by [Anas Parwez]