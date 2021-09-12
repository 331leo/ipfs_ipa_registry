// Import Packages, Init
require("dotenv").config();
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

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
  }),
  "ipfs"
);

async function insertData(data) {
  var newIpfsFile = new IpfsFile(data);
  await newIpfsFile.save((e, d) => {
    if (e) throw e;
    if (d) console.log("Successfully inserted data to DB!");
  });
}

module.exports = { insertData };
