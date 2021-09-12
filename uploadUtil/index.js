//import { Web3Storage, getFilesFromPath } from "web3.storage";
const { Web3Storage, getFilesFromPath } = require("web3.storage");
const prompt = require("prompt-sync")();
const fs = require("fs");
require("dotenv").config();

let filePath = prompt("Enter the path to the file: ").replace(/"/g, "");

const appName = prompt("Enter the name of the app: ");
const appVersion = prompt("Enter the version of the app: ");
let appRegion = prompt("Enter the region of the app(blank for Global): ");
appRegion = appRegion ? appRegion === "" : "Global";
const fileName = `${appName.replace(" ", "_")}-${appVersion}-${appRegion}.ipa`;
fs.rename(
  filePath,
  filePath.replace(filePath.replace(/^.*[\\\/]/, ""), fileName),
  (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log("finish");
    filePath = filePath.replace(filePath.replace(/^.*[\\\/]/, ""), fileName);
  }
);

const web3Client = new Web3Storage({ token: process.env.WEB3TOKEN });

async function storeWithProgress() {
  try {
    const files = await getFilesFromPath(filePath);
    // show the root cid as soon as it's ready
    const onRootCidReady = (cid) => {
      console.log("uploading files with cid:", cid);
      const appendString = `${appName},${appVersion},${appRegion},${cid},${fileName}`;
      fs.appendFile("data.csv", appendString, function (err) {
        if (err) return console.log(err);
        console.log(`${appendString}\nAppended data to CSV!`);
      });
    };

    const totalSize = files.map((f) => f.size).reduce((a, b) => a + b, 0);
    let uploaded = 0;

    const onStoredChunk = (size) => {
      uploaded += size;
      const pct = totalSize / uploaded;
      console.log(`Uploading... ${100 - pct.toFixed(2)}%`);
    };

    return web3Client.put(files, {
      name: fileName,
      maxRetries: 10,
      wrapWithDirectory: false,
      onRootCidReady,
      onStoredChunk,
    });
  } catch (err) {
    console.log(err);
  }
}

storeWithProgress();
