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
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const env=require('dotenv');

// const io = socketIo(server);
const jwt = require('jsonwebtoken');
const secretKey = "CkChatIsAChatApp3894893&(O(O(&*(0)(**y(K_(O_(~@!~~2@#343322#$2"
const url = "mongodb+srv://chandankumar6204995:QVP8wQyEMtaMiwhp@ckchat-subscription.ozh698x.mongodb.net/?retryWrites=true&w=majority"
// const url = "mongodb://localhost:27017";
// const url = "mongodb+srv://cktech:121122zshadow@zshadow.qqanmxh.mongodb.net/?retryWrites=true&w=majority"
// const url = env.MONGODB_URI;
// console.log("url=",url);
const client = new MongoClient(url);
const database = "ckchat-subscription";

const axios = require("axios");
const io = require("socket.io")(server, {
    cors: true
});
app.use(cors());

var bodyParser = require('body-parser');
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
// const verifyToken = (req, res, next) => {
//     const token = req.headers.authorization;

//     if (token) {
//         try {
//             const decoded = jwt.verify(token, secretKey);
//             req.user = decoded; // Attach user data to the request object if needed
//             return next();
//         } catch (err) {
//             return res.status(401).json({ error: 'Unauthorized' });
//         }
//     } else {
//         return res.status(401).json({ error: 'Unauthorized' });
//     }
// };
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  const origin = req.headers.origin;

  // List of authorized origins
  const authorizedOrigins = ["http://localhost:3000", "https://ckchat1.vercel.app","https://ckchat.netlify.app"];

  // Check if the request origin is in the list of authorized origins
  // if (origin && authorizedOrigins.includes(origin)) {
    // if (token) {
    //   try {
    //     const decoded = jwt.verify(token, secretKey);
    //     req.user = decoded; // Attach user data to the request object if needed
        return next();
    //   } catch (err) {
    //     return res.status(401).json({ error: "Unauthorized" });
    //   }
    // } else {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }
  // } else {
  //   return res.status(403).json({ error: "Forbidden" });
  // }
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



app.post('/save-subscription', verifyToken, async (req, res) => {
    console.log("req body=", req.body);
    try {
      const table = "subscriptions";
        const db = await dbConnect(table);
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
    return res.status(500).json({statusCode:500,body:"reCAPTCHA failed:",error});
  }
});


app.post("/send-message",verifyToken,async(req,res)=>{
  try{
let {
 user_id,
  message,
  sender_id,
  receiver_id
}=req.body;



if(!message||!receiver_id||!sender_id||!user_id){
  return res.status(400).json({statusCode:400,body:"Message,receiver and sender is required"});
}else{

  try{
var db=await dbConnect("chats");
  }catch(e){
    return res.status(500).json({statusCode:500,body:"Error connecting database:",e})
  }


   const now = new Date();
   // Manually adjust for Asia/Kolkata timezone (UTC+5:30)
   now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + 330);
   const formattedDate = now.toISOString().split("T")[0];
   const formattedTime = now.toTimeString().split(" ")[0];

   let payload = {
     message_id: Math.random() + Date.now(),
     timestamp: Date.now(),
     user_id,
     message,
     sender_id,
     receiver_id,
     dateTime: now,
     date: formattedDate,
     time: formattedTime,
   };

console.log(payload);
try{
   var result = await db.insertOne(payload);
}catch(e){
      return res
        .status(500)
        .json({ statusCode: 400, body: "Stroring message failed:", e });
}

 if(result&&result.acknowledged){
return res.status(200).json({ statusCode: 200, body: "Message sent" });
 }else{
  return res.status(400).json({ statusCode: 400, body: "Error storing message to database" });

 }

}

  }catch(e){
    return res.status(500).json({ statusCode: 500, body: "Sending message failed:",e });
  }
})

app.post("/login",async(req,res)=>{
try{
  const {email,password}=req.body;
  if(!email||!password){
    return res.status(400).json({statusCode:400,body:"Email and password are required"});
  }
  const table = "users";
  const db = await dbConnect(table);
  const existingUser = await db.findOne({ email: req.body.email });
  console.log("existingUser", existingUser);
  if (!existingUser) {
    return res.status(409).json({ statusCode: 400, body: "Incorrect email" });
  }
  console.log(bcrypt.compareSync(password, existingUser['password']));
 if( bcrypt.compareSync(password, existingUser['password'])){

   const secretKey = "loginCkChat*&&*&*Y*U(CkChat)&^%loginCkChat";

   // Prepare payload for JWT token
   let payload = {
     email: req.body["email"],
     name: existingUser.name,
     role:existingUser.role
   };
   console.log("Payload : ", payload);

   // Generate JWT token with payload
   var token = jwt.sign(payload, secretKey, { expiresIn: "60m" });

   return res.status(200).json({ statusCode: 200, body: "Login success",token:token });
 }else{
   return res.status(400).json({ statusCode: 400, body: "Incorrect password" });
 }
}catch(e){
  return res.status(500).json({statusCode:500,body:"Login Error:"+e.message})
}

})


app.post("/register-user",async(req,res)=>{ 
    try{
      const table = "users";
 const db = await dbConnect(table);
//  console.log(db);


const existingUser = await db.findOne({ email: req.body.email });
console.log("existingUser",existingUser);
if (existingUser) {
  return res.status(409).json({statusCode:409, body: "User with this email already exists." });
}


//  const result = await db.insertOne({
//    name: req.body.name,
//    email:req.body.email,
//    password:bcrypt.hashSync(req.body.password, 10),
//    verified:false,
//    role:"user",
//    tstamp: Date.now(),
//    dateTime: new Date().toLocaleString(),
//  });
//  console.log("result",result);
//  if (result && result.acknowledged) {
//    console.log("Data added successfully:", result.insertedId);

    const secretKey = "*&&*&*Y*U(CkChat)&^%";

    // Prepare payload for JWT token
    let payload = {
      email: req.body["email"],
      name: req.body.name,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    console.log("Payload : ", payload);

    // Generate JWT token with payload
    var token = jwt.sign(payload, secretKey, { expiresIn: "5m" });
    var link =  `http://localhost:3000/auth/${token}`;
   let send = await sendVerificationLinkToMail(
    req.body.email,
     req.body.name,
     link
   );
  //  console.log(send);
  

  return res.status(200).json({statusCode:200,body:"Verification email sent",message:send});
//  }
//   else {
//    console.log("Failed to add data.");
//    return res.status(400).json({statusCode:400,body:"Failed to register user"});
//  }

    }catch(e){
return res.status(500).json({statusCode:500,body:""+e})
    }
})
async function sendVerificationLinkToMail(email,name,link) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "chandankumar82945772@gmail.com",
      pass: "suwqjvqufhhkpxsh",
    },
  });

  const mailOptions = {
    from: "CkChat<no-reply@ckchat.netlify.app>",
    to: email,
    subject: "CkChat User Verification",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 200px;
          height: auto;
        }
        h1 {
          color: #000;
          text-align: center;
          font-weight: bold;
        }
        p {
          color: #333;
          font-size: 16px;
          line-height: 1.6;
          font-weight: bold;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: blue;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 900;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        #last{
           font-size: 14px;
        }
        #lnk{
          font-size: 12px
        }
      </style>
    </head>
    <body>
   <div class="container">
       <div class="logo">
          <img src="https://godda.s3.ap-south-1.amazonaws.com/speak.png" alt="CkChat Logo">
        </div>
  <h1>Email Verification</h1>
  <p>Hello ${name},</p>
  <p>To complete your registration, please click the button below to verify your email address:</p>
  <a href=${link} class="btn">Verify Email</a>
 
  <p>Please note that this verification link will expire in 5 minutes for security reasons. If you don't verify your email within this time frame, you may need to request a new verification link.</p>

  <p id="last">If you didn't request this, no further action is needed.</p>
</div>
  </body>
    </html>
    `,
  };


  try {
    await transporter.sendMail(mailOptions);
    console.log("Link sent to email:", email);
  } catch (error) {
    console.error("Error sending link to email:", error);
    throw error;
  }
}

app.post('/verify-user',async(req,res)=>{
  try{
    console.log(req.body);
    if(!req.body.token){
      res.status(400).json({statusCode:400,body:"Token required"})
    }
    const secretKey = "*&&*&*Y*U(CkChat)&^%";
    let verify=jwt.verify(req.body.token,secretKey)
console.log("verify=",verify);
let decoded=await jwt.decode(req.body.token);
console.log("decoded",decoded);
   const table = "users";
   const db = await dbConnect(table);
const existingUser = await db.findOne({ email: decoded.email });
console.log("existingUser", existingUser);
if (existingUser) {
  return res
    .status(409)
    .json({ statusCode: 409, body: "User already exists." });
}

     const result = await db.insertOne({
       name: decoded.name,
       email:decoded.email,
       password:decoded.password,
       verified:true,
       role:"user",
       profileImage:"",
       tstamp: Date.now(),
       dateTime: new Date().toLocaleString(),
     });
     console.log("result",result);
     if (result && result.acknowledged) {
       console.log("User added successfully:", result.insertedId);
       res.status(200).json({statusCode:200,body:"User added successfully"});
  }else{
   return res.status(400).json({ statusCode: 400, body: "Error:" + result });
  }
  }catch(e){
    return res.status(500).json({ statusCode: 500, body: "Error:" + e });
  }
})


app.get('/all-users',verifyToken,async(req,res)=>{
  try{
       const table = "users";
       const db = await dbConnect(table);
const users = await db.find({}, { projection: { name: 1, email: 1, _id: 0 } }).toArray();

       console.log(users);
       return res.status(200).json({statusCode:200,body:users});

  }catch(e){
    console.log(e);
    return res.status(500).json({body:"Server Error:"+e});
  }
})



app.post('/send-notification', verifyToken, async (req, res) => {
    if (!req.body.message) {
        res.status(400).send("Failed: Message is missing");
    }
    // else if (subDatabase.length === 0) {
    //     res.status(400).send("Failed: No subscriptions available");
    // } 
    else {
        try {
          const table = "subscriptions";
            const db = await dbConnect(table);
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






async function dbConnect(table) {
  try {
    // Connect to the MongoDB client
    const client = await MongoClient.connect(url, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    // Get the database and return the collection
    const db = client.db(database);
    return db.collection(table);
  } catch (e) {
    // Throw the error to indicate failure
    throw new Error(`Failed to connect to the database: ${e.message}`);
  } finally {
    // Close the MongoDB client to release resources
    if (client) {
      await client.close();
    }
  }
} 



server.listen(port, () => {
    console.log('Server is running on port:', port);
});
