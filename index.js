const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
let port = process.env.PORT || 3001;
const app = express();
const cors = require('cors');
const server = http.createServer(app);
const webPush = require('web-push');
const Ip = require('ip');
const { MongoClient } = require("mongodb");
// const io = socketIo(server);
const jwt = require('jsonwebtoken');
const secretKey = "CkChatIsAChatApp3894893&(O(O(&*(0)(**y(K_(O_(~@!~~2@#343322#$2"
const url = "mongodb+srv://chandankumar6204995:QVP8wQyEMtaMiwhp@ckchat-subscription.ozh698x.mongodb.net/?retryWrites=true&w=majority"
// const url = "mongodb://localhost:27017";
// const url = "mongodb+srv://cktech:121122zshadow@zshadow.qqanmxh.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(url);
const database = "ckchat-subscription";
const table = "subscriptions";
const axios = require("axios");
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

const emailToSocketMapping=new Map();
const socketToEmailMapping=new Map();
let allGlobalUsers=[];
const roomUsers = {};
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

// const subDatabase = [];



app.get("/", (req, res) => {
    res.send("Server is running");
})
app.get('/ip',  (req, res) => {
    // console.log(req.socket.remoteAddress);
    // console.log(req.ip);
    var ip = Ip.address();

    res.send(ip);
})

app.post('/register-user',)

app.post('/save-subscription', verifyToken, async (req, res) => {
    console.log("req body=", req.body);
    try {
        const db = await dbConnect();
        console.log(db);
        const result = await db.insertOne({
            subscription: req.body,
            tstamp:Date.now(),
            dateTime: (new Date()).toLocaleString()
        });
        console.log(result)
        // console.log(result.acknowledged)

        // subDatabase.push(req.body);
        // console.log("subDatabase=", subDatabase);   
        res.json({ status: "Success", message: "Subscription saved", result: result });
    } catch (e) {
        res.json({ status: "Failed", message: e });
    }

})


// app.post('/send-notification', (req, res) => {
//     if (!req.body.message) {
//         res.status(400).send("failed");
//     } else {
//         webPush.sendNotification(subDatabase[0], req.body.message);
//         res.json({ status: "Success", message: "Notification sent" });
//     }
// })

async function verifyRecaptcha(recaptchaResponse) {
  try {
    console.log("under vefiry");
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: "6Ldj98YpAAAAAE--9KZUVIi7U5aFQbLvILBEsRuz",
          response: recaptchaResponse,
        },
      }
    );


    return response.status;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}

app.post("/verifyCaptcha", async (req, res) => {
//   const { recaptchaToken } = req.body;
//   console.log(req.body);
// console.log("recaptchaToken",recaptchaToken);
  try {
    const isRecaptchaValid = await verifyRecaptcha(req.body.reCarecaptchaToken);
console.log(verifyRecaptcha);
    if (!isRecaptchaValid) {
      return res.status(400).json({statusCode:400, body: "reCAPTCHA verification failed" });
    } else {
      //Add your success response here
      return res
        .status(200)
        .json({ statusCode: 200, body: "reCAPTCHA verification successful" });
    }
  } catch (error) {
    console.log(error);
  }
});





app.post('/send-notification', verifyToken, async (req, res) => {
    if (!req.body.message) {
        res.status(400).send("Failed: Message is missing");
    }
    // else if (subDatabase.length === 0) {
    //     res.status(400).send("Failed: No subscriptions available");
    // } 
    else {
        try {
            const db = await dbConnect();
            // console.log(db);
            const result = await db.find({}).toArray();;
            console.log(result)
            if (result != undefined && result.length != 0) {
                for (let i = 0; i < result.length; i++) {
                    webPush.sendNotification(result[i]['subscription'], req.body.message)
                        .then(() => {
                        })
                        .catch((error) => {
                            console.error("Notification failed:", error);

                            // res.status(500).send("Failed: Notification could not be sent");
                        });
                }
                res.json({ status: "Success", message: "Notification sent", msg: req.body.message, to: result });
            } else {
                res.status(500).send("Failed: Notification could not be sent");
            }
        } catch (e) {
            res.status(500).send("Failed: Notification could not be sent:" + e);  
        }

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





app.post("/getUsers",verifyToken,async(req,res)=>{
console.log("from getUsers",req.body);
res.status(200).json({users:roomUsers[req.body.roomId]?roomUsers[req.body.roomId]:[]})
})

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);


socket.on("disconnecting", () => {
console.log("under disconnecting");
  console.log(socket.rooms); // the Set contains at least the socket ID
   const userName = socketToEmailMapping.get(socket.id);
   console.log("userName", userName);
   if(userName){
   const rooms = socket.rooms;
   console.log("rooms", rooms);
   for (const room of rooms) {
     console.log("room", room);
     if (room !== socket.id) {
       console.log("under if");
       // socket.to(room).emit("user left", socket.id);
    //    socket.emit("user-left", { userName });
    socket.broadcast.to(room).emit("user-left",userName);


       if (roomUsers[room]) {  
        // Remove the user from the room

        roomUsers[room] = roomUsers[room].filter((id) => id !== userName);
      }
      console.log("roomUsers while leaved=", roomUsers);
   

     }
    //   else {
    //    console.log("under else");
    // //    socket.to(room).emit("user-left", { userName: userName, roomId: roomId });
    //  }
   }
}
});


    // Handle events when a user connects, disconnects, or sends messages
    socket.on('disconnect', () => {
      console.log("user disconnected", socket.id);
     
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg); // Broadcasting the message to all connected clients
    });

socket.on('join-room',(data)=>{
console.log("new con data on join room",data);
const {userName,roomId}=data;
emailToSocketMapping.set(userName,socket.id);
console.log("emailToSocketMapping",emailToSocketMapping);

socketToEmailMapping.set(socket.id,userName);
console.log("socketToEmailMapping", socketToEmailMapping);
socket.join(roomId);
socket.emit("joined-room",data);
// socket.emit("user-joined",data);
// socket.broadcast.to(roomId).emit('user-joined',{userName})
//   socket.to(roomId).emit("user-joined",data);
socket.broadcast.to(roomId).emit("user-joined", data);
 if (!roomUsers[roomId]) {
   roomUsers[roomId] = [];
 }

 // Add the user to the room
 roomUsers[roomId].push(userName);
console.log("roomUsers while join=",roomUsers)
})




    socket.on('room-message', (data) => {
        console.log('data on room message: ' + data.message,data.userName);

        console.log("roomId",data.roomId);
        socket.broadcast.to(data.roomId).emit('room-message', data )
        // io.emit('chat message', msg); // Broadcasting the message to all connected clients
    });



//     socket.on("user-left", (data) => {
//         console.log("user left",data);
//       // Assuming you have a list of users in the room
//     //   const userIndex = users.findIndex((user) => user.id === socket.id);
//     //   if (userIndex !== -1) {
//     //     const user = users[userIndex];
//     //     // Remove the user from the list
//     //     users.splice(userIndex, 1);

//         // Notify other users in the room about the departure
//         // socket.to(data.roomId).emit("user-left", { userName: data });
// socket.broadcast.to(data.roomId).emit("user-left",data.userName);
//     //   }
//     });

    socket.on("leave-room", (data) => {
        console.log("leave-room data",data);
        console.log(data.roomId);
        console.log(data.userName);
      // Ensure the room exists in the data structure 
       socket.leave(data.roomId);
           socket.broadcast.to(data.roomId).emit("user-left", data.userName);
      if (roomUsers[data.roomId]) {
        // Remove the user from the room

        roomUsers[data.roomId] = roomUsers[data.roomId].filter((id) => id !== data.userName);
      }
      console.log("roomUsers while leave=", roomUsers);
    });





socket.on("call-user",(data)=>{
    const {roomId,userName,offer}=data;
    const fromUser=socketToEmailMapping.get(socket.id);
    const socketId=emailToSocketMapping.get(userName);
    socket.to(socketId).emit('incomming-call',{from:fromUser,offer});
});






});







async function dbConnect() {
    try {
        let result = await client.connect();
        // console.log(result);
        // console.log(database, table);
        let db = result.db(database);
        // console.log(db);
        // let collection = db.collection('user')
        return db.collection(table);
        // let response = await collection.find({ id: 'ck@gmail.com' }).toArray()
        // console.log(response)
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
}





server.listen(port, () => {
    console.log('Server is running on port:', port);
});
