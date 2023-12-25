const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
let port = process.env.PORT || 3001;
const app = express();
const cors = require('cors');
const server = http.createServer(app);
// const io = socketIo(server);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust this to match your React app's URL
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to match your React app's URL
    methods: ['GET', 'POST'],
    credentials: true
}));

var bodyParser = require('body-parser')


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.get("/", (req, res) => {
    res.send("hello");
})
io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle events when a user connects, disconnects, or sends messages
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg); // Broadcasting the message to all connected clients
    });
});

server.listen(port, () => {
    console.log('Server is running on port:', port);
});
