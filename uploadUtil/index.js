// Import Packages, Init Project
require("dotenv").config();
const { Web3Storage, getFilesFromPath } = require("web3.storage");
const prompt = require("prompt-sync")();
const fs = require("fs");
const insertData = require("./db").insertData;
const { exit } = require("process");
// var mongoose = require("mongoose");
// mongoose.connect(process.env.MONGO_URL);
// var db = mongoose.connection;

// Application Data prompt
let filePath = prompt("Enter the path to the file: ").replace(/"/g, "");
const appName = prompt("Enter the name of the app: ");
const appVersion = prompt("Enter the version of the app: ");
let appRegion = prompt("Enter the region of the app(blank for Global): ");
appRegion = appRegion ? appRegion === "" : "Global";

// Rename File
const fileName = `${appName.replaceAll(
  " ",
  "_"
)}-${appVersion}-${appRegion}.ipa`;
let newFilePath = filePath.replace(filePath.replace(/^.*[\\\/]/, ""), fileName);
fs.rename(filePath, newFilePath, (err) => {
  if (err) {
    throw err;
  }
  console.log("finish");
});

// Put the file in the IPFS Network
const web3Client = new Web3Storage({ token: process.env.WEB3TOKEN });
async function storeWithProgress() {
  try {
    const files = await getFilesFromPath(newFilePath);
    // show the root cid as soon as it's ready
    const onRootCidReady = (cid) => {
      console.log("uploading files with cid:", cid);
      const data = {
        name: appName,
        version: appVersion,
        region: appRegion,
        cid: cid,
        file: fileName,
      };
      insertData(data);
      // const appendString = `${appName},${appVersion},${appRegion},${cid},${fileName}`;
      // fs.appendFile("data.csv", appendString, function (err) {
      //   if (err) return console.log(err);
      //   console.log(`${appendString}\nAppended data to CSV!`);
      // });
    };

    const totalSize = files.map((f) => f.size).reduce((a, b) => a + b, 0);
    let uploaded = 0;

    const onStoredChunk = (size) => {
      uploaded += size;
      const pct = totalSize / uploaded;
      console.log(`Uploading... ${100 - pct.toFixed(2)}%`);
    };

    return await web3Client.put(files, {
      name: fileName,
      maxRetries: 10,
      wrapWithDirectory: true,
      onRootCidReady,
      onStoredChunk,
    });
  } catch (err) {
    console.log(err);
  }
}

storeWithProgress();
