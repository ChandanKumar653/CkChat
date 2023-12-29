const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
let port = process.env.PORT || 3001;
const app = express();
const cors = require('cors');
const server = http.createServer(app);
const webPush = require('web-push');
const Ip = require('ip');
// const io = socketIo(server);
const jwt = require('jsonwebtoken');
const secretKey = "CkChatIsAChatApp3894893&(O(O(&*(0)(**y(K_(O_(~@!~~2@#343322#$2"
const io = require("socket.io")(server, {
    cors: true
});
app.use(cors());

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

let token = jwt.sign({
    data: 'CkChat'
}, secretKey)                    //, { expiresIn: '1h' });

console.log(token);
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        try {
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded; // Attach user data to the request object if needed
            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

// Example protected route
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route' });
});








const apiKeys = { "publicKey": "BGOL2kpe-fHu-_DorSKvrULdEmyGMbwYkax8qyBU6_rRfaG1NgW8h_bj0cUmJlGFXSJ2U6QScipCDXY_4czleNY", "privateKey": "ZqwlksKj4RTIus33oPInHSWz3wKeepXVtbu7oT5PsoE" }
webPush.setVapidDetails(
    'mailto:chandankumar6204995@gmail.com',
    apiKeys.publicKey,
    apiKeys.privateKey
)

const subDatabase = [];



app.get("/", (req, res) => {
    res.send("Server is running");
})
app.get('/ip', verifyToken, (req, res) => {
    // console.log(req.socket.remoteAddress);
    // console.log(req.ip);
    var ip = Ip.address();

    res.send(ip);
})
app.post('/save-subscription', (req, res) => {
    console.log("req body=", req.body);

    subDatabase.push(req.body);
    console.log("subDatabase=", subDatabase);
    res.json({ status: "Success", message: "Subscription saved" });
})

// app.post('/send-notification', (req, res) => {
//     if (!req.body.message) {
//         res.status(400).send("failed");
//     } else {
//         webPush.sendNotification(subDatabase[0], req.body.message);
//         res.json({ status: "Success", message: "Notification sent" });
//     }
// })


app.post('/send-notification', verifyToken, (req, res) => {
    if (!req.body.message) {
        res.status(400).send("Failed: Message is missing");
    } else if (subDatabase.length === 0) {
        res.status(400).send("Failed: No subscriptions available");
    } else {
        webPush.sendNotification(subDatabase[0], req.body.message)
            .then(() => {
                res.json({ status: "Success", message: "Notification sent" });
            })
            .catch((error) => {
                console.error("Notification failed:", error);
                res.status(500).send("Failed: Notification could not be sent");
            });
    }
});






io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, secretKey);
            socket.decoded = decoded; // Attach user data to the socket if needed
            return next();
        } catch (err) {
            return next(new Error('Authentication error'));
        }
    } else {
        return next(new Error('Authentication error'));
    }
});




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
