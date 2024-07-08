import express from "express";
import axios from "axios";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const term = req.query.term;
  getTracks(req, res, "short_term");
});

router.get("/search", async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const users = await User.find({}, "_id");
    const currentUserID = req.headers.userid;
    let userIds = users.map((user) => user._id);
    userIds = userIds.filter((userId) => userId !== currentUserID);

    if (searchTerm) {
      const filteredUserIds = userIds.filter((userId) =>
        userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      res.json(filteredUserIds);
    } else {
      res.json(userIds);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

const getTracks = async (req, res, term) => {
  try {
    const token = req.headers.authorization;
    const userId = req.headers.userid;
    if (!token || !userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tracks = await spotifyTracks(token, term);

    return res.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({ message: "Error fetching tracks" });
  }
};

export const spotifyTracks = async (token, term) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/tracks?time_range=${term}&limit=50&offset=0`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const tracks = response.data.items.map((item) => ({
      album: {
        album_type: item.album.album_type,
        arists: item.album.artists,
        external_urls: item.album.external_urls.spotify,
        id: item.album.id,
        images: item.album.images,
        name: item.album.name,
      },
      external_urls: item.external_urls.spotify,
      id: item.id,
      name: item.name,
      uri: item.uri,
    }));

    return tracks;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return null;
  }
};

export default router;
