const axios = require("axios");
const YoutubeMusicApi = require("youtube-music-api");

const api = new YoutubeMusicApi();

// Read environment variables
require("dotenv").config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const AUTH_URL = "https://accounts.spotify.com/api/token";
const valid_api_keys = [
  process.env.key1,
  process.env.key2,
  process.env.key3,
  "free",
];

export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  const { key, url } = req.body;
  const api_key = key;
  const trackURL = url;

  if (!api_key) {
    return res.status(400).json({ error: "API key is missing" });
  }

  if (!valid_api_keys.includes(api_key)) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  if (!trackURL) {
    return res
      .status(400)
      .json({ error: "URL parameter is missing or invalid" });
  }

  const trackID = trackURL.substring(31);
  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  try {
    const tokenResponse = await axios.post(
      AUTH_URL,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    const trackEndpoint = `https://api.spotify.com/v1/tracks/${trackID}`;

    const trackResponse = await axios.get(trackEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const trackData = trackResponse.data;
    const trackName = trackData.name;
    const artistName = trackData.artists[0].name;
    const albumName = trackData.album.name;
    const releaseDate = trackData.album.release_date;
    const imageUrl = trackData.album.images[1].url;

    if (!trackName || !artistName || !albumName || !releaseDate || !imageUrl) {
      return res.status(404).json({ error: "Track not found" });
    }

    await api.initalize();

    const result = await api.search(trackName + "  " + artistName, "song");
    const song = result.content[0];
    const videoId = song.videoId;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (!url || url === "" || url === undefined) {
      return res.status(404).json({ error: "Track not found" });
    }

    res.json({
      url: url,
      name: trackName,
      artist: artistName,
      albumName: albumName,
      releaseDate: releaseDate,
      img_url: imageUrl,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
