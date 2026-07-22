// We are Building server
//SECTION A-Boilerrplate:HTTP+Socket.io setup
        const express=require('express');
        const app=express();
        const http=require('http');
        const {Server}=require('socket.io');//imports constucte class fom socket io to manage eal time bi diectional communication
        const ACTIONS=require('./src/Actions');

        const server=http.createServer(app);
        const io=new Server(server);
        //we didnt use app.listen() because it automatically ceates http sever behind the scenes , 
        // butt we are using sockets , so we must sepeate them to allow them to shae the same port

// SECTION B- Tack whos's in which room
        const userSocketMap={};
        //{ 'socket-id-abc': 'Anas' , 'socket-id-xyz': 'Bob}
        function getAllConnectedClients(roomId){
            return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
                (socketId)=>({
                    socketId,
                    username: userSocketMap[socketId],
                })
                //this loops on each rraw internal set and tansforms it into clean, readable data;
            );
        }
// SECTION-C -Handles Socket Events
        io.on('connection', (socket) => {
        console.log('socket connected:', socket.id);

        socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
            userSocketMap[socket.id] = username;
            socket.join(roomId);
            // saves uses identity : links thee unique connection id to thete name;
            // socket.json places this connection into an isolated virrtual channel handled by soclet.io

            const clients = getAllConnectedClients(roomId);
            clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
            });
            // this fetches updated list of users , then loop through every single connected client and sends them JOINED notification
        });

        socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
            socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });// 
        });
        //socket.in() instead of io.to(), send changed to code to everyone except the one who is writing to pevent bouncing cursor or lag;

        socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
            io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
        });
        // if someone joins room midway , they may not atart with blank screen so server send code to a specific user id

        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms];
            rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
            });
            // it copies all the room this specific user was part of
            // sends DISCONNECTED msg to eveyone in those rooms so their sidebar immediately removes this user avatar
            delete userSocketMap[socket.id];
            socket.leave();
            // deletes user id from usersocketMap object to clear memory
        });
        });

// SECTION-D - Strat The Server
        const PORT=process.env.PORT||5000;
        server.listen(PORT,()=>console.log(`Listening on port ${PORT}`));