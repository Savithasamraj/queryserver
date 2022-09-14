const express = require("express");
const app = express();
const cors = require("cors");
const bcryptjs = require("bcryptjs");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv")
const URL = process.env.db;


const jwt = require("jsonwebtoken");
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
let authenticate = function (req, res, next) {
  if (req.headers.authorization) {
    try {
      let verify = jwt.verify(req.headers.authorization,process.env.SECRET);

      if (verify) {
        req.userid = verify._id;
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.json("error");
    res.status(401).json({ message: "Unauthorized" });
  }
};

app.post("/register", async function (req, res) {
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("query");

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    req.body.password = hash;
    await db.collection("login").insertOne(req.body);

    await connection.close();

    res.json({
      message: "Successfully Registered",
    });
  } catch (error) {
    res.json({
      message: "Error",
    });
  }
});
app.post("/login", async function (req, res) {
  try {
    const connection = await mongoClient.connect(URL);
console.log("data")
    const db = connection.db("query");

    const user = await db
      .collection("login")
      .findOne({ username: req.body.username });

    if (user) {
      const match = await bcryptjs.compare(req.body.password, user.password);
      if (match) {
        // Token
        const token = jwt.sign({ _id: user._id },process.env.SECRET);

        res.json({
          message: "Welcome to Query Ticket Raising Portal",
          token,
        
        });
      } else {
        res.json({
          message: "Password is incorrect",
          token,
          _id,
        });
      }
    } else {
      res.json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.log("error");
  }
});
app.post("/form", authenticate, async function (req, res) {
  try {
    const connection = await mongoClient.connect(URL);
  
    const db = connection.db("query");
    req.body.userid = mongodb.ObjectId(req.userid);
    
req.body.date=new Date().toLocaleDateString() ;
req.body.time=new Date().toLocaleTimeString()
    const body = await db.collection("form").insertOne(req.body);
    // const req.body.question=body.length

    await connection.close();
    res.json({
      message: "query created",
    });
  } catch (error) {
    console.log(error);
  }
});
app.get("/dashboard",authenticate, async function (req, res) {
  
  try{
    const connection = await mongoClient.connect(URL);
    console.log("data")
    const db = connection.db("query");
    console.log(req.userid);
    const data = await db.collection("form").find({userid:mongodb.ObjectId (req.userid)}).sort({"_id":-1}).toArray()
    console.log(data);
    await connection.close();
    res.send(data);
  }
    // res.json({
    //   message: "query displaced",
    
    // });
    catch(error){
console.log(error)
    }
  
});
app.listen(5000, () => {
  console.log("running in ");
});
