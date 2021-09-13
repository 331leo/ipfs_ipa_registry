import express from "express";
import cors from "cors";
import { config } from "dotenv";
config();
import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

const app = express();

//Add the client URL to the CORS policy
const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

db.on("error", function () {
  console.log("DB Connection Failed!");
});
db.once("open", function () {
  console.log("DB Connected!");
});

var IpfsFile = mongoose.model(
  "ipfs",
  mongoose.Schema({
    name: String,
    version: String,
    region: String,
    cid: { type: String, required: true, unique: true },
    file: String,
    artwork: String,
    bundleID: String,
    genres: [String],
    storeLink: String,
    artistName: String,
  }),
  "ipfs"
);

app.get("/", async (req, res) => {
  IpfsFile.find()
    .lean()
    .exec((err, datas) => {
      return res.end(JSON.stringify(datas));
    });
});

//Start the server in port 8081
const server = app.listen(8000, function () {
  const port = server.address().port;

  console.log("App started at http://localhost:%s", port);
});
