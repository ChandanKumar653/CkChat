const { MongoClient } = require("mongodb");
const dontenv = require("dotenv");
// const url = "mongodb+srv://cktech:121122zshadow@zshadow.qqanmxh.mongodb.net/?retryWrites=true&w=majority"
const url = env.MONGODB_URI;
console.log("url=",url);
const client = new MongoClient(url);


const database = "ckchat-subscription";

async function connectToMongoDB() {
  

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

module.exports = connectToMongoDB;
