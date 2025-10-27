const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express());
app.use(express.json());

// console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdfyvmk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeesCollections = client.db("coffeesDB").collection("coffees");
    const usersCollections = client.db("coffeesDB").collection("users");

    app.get("/coffees", async (req, res) => {
      const result = await coffeesCollections.find().toArray();
      res.send(result);
    });

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body;
      // console.log("Received coffee data:", newCoffee);
      const result = await coffeesCollections.insertOne(newCoffee);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;
      const updatedDoc = {
        $set: updatedCoffee,
      };

      // const updatedDoc = {
      //     $set: {
      //       name: updatedCoffee.name,
      //       supplier: updatedCoffee.supplier
      //     }
      // }

      const result = await coffeesCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollections.deleteOne(query);
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeesCollections.findOne(query);
      res.send(result);
    });

    // User related APIs

    //  app.get("/coffees", async (req, res) => {
    //   const result = await coffeesCollections.find().toArray();
    //   res.send(result);
    // });

    app.get("/users", async (req, res) => {
      const result = await usersCollections.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      console.log(userProfile);
      const result = await usersCollections.insertOne(userProfile);
      res.send(result);
    });

    app.patch("/users",async(req,res) => {
      const {email,lastSignInTime} = req.body;
      const filter = {email: email};
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime
        }
      }

      const result = await usersCollections.updateOne(filter,updatedDoc)
      res.send(result)
    })

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollections.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
