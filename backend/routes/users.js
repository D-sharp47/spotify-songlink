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
    const users = await User.find({}, "_id _json.display_name");
    const currentUserID = req.headers.userid;
    const user = await User.findOne({ _id: currentUserID }).lean();
    let userIdsAndNames = users
      .filter(
        (u) =>
          u._id !== currentUserID &&
          !user?.friends.some((f) => f.friendId === u._id)
      )
      .map((user) => ({ id: user._id, name: user._json.display_name }));

    if (searchTerm) {
      const filteredUserIds = userIdsAndNames
        .filter((u) => {
          return (
            u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
        .map((u) => u.id);
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

  const playlistId = await setUserDataPlaylist(token, userId, name, tracks);

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

export const setUserDataPlaylist = async (
  token,
  userId,
  name,
  tracks = [],
  refresh = false
) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const nameToTermDict = {
    "Top Songs Short Term": "short_term",
    "Top Songs Medium Term": "medium_term",
    "Top Songs Long Term": "long_term",
  };
  const term = nameToTermDict[name];

  if (!term) {
    throw new Error("Invalid playlist name");
  }

  if (!user.topSongs || !user.topSongs[term]?.created) {
    console.log("setting playlist");
    const playlistId = await createUserDataPlaylist(
      token,
      userId,
      name,
      tracks
    );
    if (playlistId) {
      if (!user.topSongs) {
        user.topSongs = {};
      }
      user.topSongs[term] = { created: true, playlistId };
      await user.save();
      return playlistId;
    } else {
      throw new Error("Error creating playlist");
    }
  } else {
    if (refresh) {
      await updateUserDataPlaylist(
        token,
        user.topSongs[term].playlistId,
        tracks
      );
    }
    return user.topSongs[term].playlistId;
  }
};

export const updateUserDataPlaylist = async (token, playlistId, tracks) => {
  try {
    const currentTracks = await getAllTrackUrisFromPlaylist(token, playlistId);
    removeTracksFromPlaylist(token, playlistId, currentTracks);
    addTracksToPlaylist(token, playlistId, tracks);
  } catch (error) {
    console.error("Error updating playlist:", error);
  }
};

export const createUserDataPlaylist = async (
  token,
  userId,
  name,
  tracks = []
) => {
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

    unfollowPlaylist(token, playlistId);

    return playlistId;
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
};

export const unfollowPlaylist = async (token, playlistId) => {
  axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getAllTrackUrisFromPlaylist = async (token, playlistId) => {
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const trackUris = response.data.items.map((item) => item.track.uri);
    return trackUris;
  } catch (error) {
    console.error("Error getting all track uris from playlist:", error);
    return null;
  }
};

export const removeTracksFromPlaylist = async (token, playlistId, tracks) => {
  try {
    if (tracks.length === 0) {
      console.log("No tracks to remove from playlist");
      return;
    }

    await axios.delete(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          tracks: tracks.map((track) => ({ uri: track })),
        },
      }
    );
  } catch (error) {
    console.error("Error removing tracks from playlist:", error);
  }
};

export default router;
