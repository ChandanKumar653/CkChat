const connectToMongoDB = require("../Modules/Register");
const Register = async (userData) => {
  try {
     const db = await connectToMongoDB();

     const usersCollection = db.collection("users");

     const result = await usersCollection.insertOne(userData);
     console.log("new user registered:",result);
     return res.status(200).json({statusCode:200,body:"User registered successfully"});
  } catch (e) {
    return res.status(500).json({
      statusCode: 500,
      body: "Error registering user:" + e,
    });
  }
};

module.exports = Register;
