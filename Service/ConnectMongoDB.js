const { MongoClient } = require("mongodb");
const dontenv = require("dotenv");

// const uri ="mongodb+srv://chandankumar6204995:QVP8wQyEMtaMiwhp@ckchat-subscription.ozh698x.mongodb.net/?retryWrites=true&w=majority";
const uri = process.env.MONGODB_URI;
console.log(uri);
const dbName = "ckchat-subscription"; 

async function connectToMongoDB() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; 
  }
}

module.exports = connectToMongoDB;
