import express from "express";
import axios from "axios";
import User from "../models/User.js";
import { addTracksToPlaylist, createPlaylist } from "./routine.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const term = req.query.term;
  getTracks(req, res, term);
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

router.post("/createPlaylist", async (req, res) => {
  const { name, tracks } = req.body;
  let token = req.headers.authorization;
  const userId = req.headers.userid;

  if (!name) {
    return res.status(400).json({ message: "Playlist name is required" });
  }

  if (!token || !userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (token.slice(0, 6) === "Bearer") {
    token = token.slice(7);
  }

  const playlistId = await createTempPlaylist(token, userId, name, tracks);

  if (playlistId) {
    return res.json({ playlistId });
  } else {
    return res.status(500).json({ message: "Error creating playlist" });
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

    const tracks = response.data.items.map((item) => item.uri);

    return tracks;
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return null;
  }
};

export const createTempPlaylist = async (token, userId, name, tracks = []) => {
  try {
    let playlistId = null;
    if (tracks.length > 0) {
      const response = await createPlaylist(token, userId, name);
      playlistId = response.playlist_id;
      if (!playlistId) {
        throw new Error("Null playlistId");
      }
      await addTracksToPlaylist(token, playlistId, tracks);
    } else {
      console.error("No tracks to add to playlist");
      return null;
    }

    axios.delete(
      `https://api.spotify.com/v1/playlists/${playlistId}/followers`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return playlistId;
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
};

export default router;
