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
  "Schema",
  mongoose.Schema({
    name: "string",
    version: "string",
    region: "string",
    cid: { type: "string", required: true, unique: true },
    file: "string",
  })
);

async function insertData(data) {
  var newIpfsFile = new IpfsFile(data);
  await newIpfsFile.save((e, d) => {
    if (e) throw e;
    if (d) console.log("Successfully inserted data to DB!");
  });
}

module.exports = { insertData };
