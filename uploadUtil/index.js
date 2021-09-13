// Import Packages, Init Project
import { config } from "dotenv";
config();
import { Web3Storage, getFilesFromPath } from "web3.storage";
import promptSync from "prompt-sync";
const prompt = promptSync();
import fs from "fs";
import { exit } from "process";
import { insertData } from "./db.js";
import { getMeta } from "./meta.js";

// Application Data prompt
let filePath = prompt("Enter the path to the file: ").replace(/"/g, "");
let appName = prompt("Enter the name of the app: ");
const appVersion = prompt("Enter the version of the app: ");
let appRegion = prompt("Enter the region of the app(blank for Global): ");
appRegion = appRegion ? appRegion === "" : "Global";
getMeta(appName).then((meta) => {
  if (meta.trackName) {
    appName = meta.trackName;
    console.log(
      `\nFound App on App Store!: ${meta.trackName}\nLastest Version on App Store: ${meta.latestVersion}\nView on App Store: ${meta.storeLink}\n`
    );
  }
});

await new Promise((resolve) => setTimeout(resolve, 1000));

// Rename File
const fileName = `${appName
  .replace(/:/, "")
  .replace(/ /g, "_")}-${appVersion}-${appRegion}.ipa`;
let newFilePath = filePath.replace(filePath.replace(/^.*[\\\/]/, ""), fileName);
fs.rename(filePath, newFilePath, (err) => {
  if (err) {
    throw err;
  }
  console.log(".ipa File Renamed!\n");
});

await new Promise((resolve) => setTimeout(resolve, 1000));

// Put the file in the IPFS Network
const web3Client = new Web3Storage({ token: process.env.WEB3TOKEN });
async function storeWithProgress() {
  try {
    const files = await getFilesFromPath(newFilePath);

    // show the root cid as soon as it's ready

    const onRootCidReady = (cid) => {
      // const appendString = `${appName},${appVersion},${appRegion},${cid},${fileName}`;
      // fs.appendFile("data.csv", appendString, function (err) {
      //   if (err) return console.log(err);
      //   console.log(`${appendString}\nAppended data to CSV!`);
      // });
      console.log(`Uploading to IPFS Network: ${cid}`);
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

storeWithProgress().then((cid) => {
  (async (cid) => {
    const meta = await getMeta(appName);
    console.log(
      `Uploaded ipa to IPFS Network\nApp: ${appName}, Version: ${appVersion}, bundleID: ${meta.bundleID}\nCID: ${cid}`
    );
    const data = {
      name: appName,
      version: appVersion,
      region: appRegion,
      cid: cid,
      file: fileName,
      artwork: meta.artwork,
      bundleID: meta.bundleID,
      genres: meta.genres,
      storeLink: meta.storeLink,
      artistName: meta.artistName,
    };
    await insertData(data);
    new Promise((resolve) => setTimeout(resolve, 1000)).then(() => exit());
  })(cid);
});
