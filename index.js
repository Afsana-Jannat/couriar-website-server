const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 9000;
require("colors");

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("service is running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbzul73.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
client
  .connect()
  .then(() => console.log("MongoDB connected".blue.bold))
  .catch((error) => console.log("Mongo connection error".red.bold));

async function run() {
  const serviceCollection = client.db("serviceDb").collection("services");
  const bookingCollection = client.db("serviceDb").collection("bookings");

  // get all service
  app.get("/services", async (req, res) => {
    try {
      const services = await serviceCollection.find().toArray();

      res.send({
        acknoledgement: true,
        data: services,
      });
    } catch (error) {
      res.status(500).send({
        message: "There is a server side error",
      });
    }
  });
  app.get("/services/:id", async (req, res) => {
    try {
      const service = await serviceCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      res.send({
        success: true,
        ...service,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "There is a server side error",
      });
    }
  });

  // BOOKINGS
  // post
  app.post("/bookings", async (req, res) => {
    try {
      const service = await bookingCollection.insertOne(req.body);

      res.send({
        success: true,
        data: service,
      });
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "There is a server side error! data can't be saved",
      });
    }
  });
  // get
  app.get("/bookings", async (req, res) => {
    try {
      const bookings = await bookingCollection.find().toArray();

      res.send({
        success: true,
        data: bookings,
      });
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "There is a server side error! data not found",
      });
    }
  });
  // get single booking
  app.get("/bookings/:id", async (req, res) => {
    try {
      const book = await bookingCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      res.send({
        success: true,
        ...book,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Data not found!",
      });
    }
  });
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Track now server is running on port ${port}`.yellow.bold);
});
