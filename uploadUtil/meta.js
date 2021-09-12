import axios from "axios";

export async function getMeta(appName) {
  var meta = {
    artwork: undefined,
    bundleID: undefined,
    genres: undefined,
    trackName: undefined,
    latestVersion: undefined,
    artistName: undefined,
    link: undefined,
  };
  const response = await axios.get(
    encodeURI(
      `http://itunes.apple.com/search?term=${appName}&country=US&media=software&limit=1`
    )
  );
  const metaData = response.data.results;
  if (metaData.length === 0) {
    console.log("No Such game found on App Store. Metadata not included");
  } else {
    meta.artwork = metaData[0].artworkUrl100;
    meta.bundleID = metaData[0].bundleId;
    meta.genres = metaData[0].genres;
    meta.trackName = metaData[0].trackName;
    meta.latestVersion = metaData[0].version;
    meta.artistName = metaData[0].artistName;
    meta.link = metaData[0].trackViewUrl;
  }
  return meta;
}
