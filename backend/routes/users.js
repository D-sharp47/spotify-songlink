import express from "express";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import axios from "axios";
import User from "../models/User.js";
import { addTracksToPlaylist, createPlaylist } from "./routine.js";

dotenv.config();
const s3 = new AWS.S3();
const s3_bucket = process.env.AWS_S3_BUCKET_NAME;

const router = express.Router();

router.get("/image", async (req, res) => {
  const userId = req.query.userId;
  const useSpotifyImg = req.query.spotify === "true";
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
    rs;
  }
  if (useSpotifyImg || user.settings.useSpotifyImg) {
    return res.status(200).send({ url: user._json.image.spotifyUrl });
  }
  if (user._json.image.overwritten && !user._json.image?.s3key) {
    return res.status(202).send({ url: undefined });
  }

  const params = {
    Bucket: s3_bucket,
    Key: user._json.image.s3key,
    Expires: 60 * 60 * 2, // 2 hours
  };

  try {
    const url = s3.getSignedUrl("getObject", params);
    res.status(200).send({ url });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating URL");
  }
});

router.get("/tracks", async (req, res) => {
  const term = req.query.term;
  getTracks(req, res, term);
});

router.get("/preferences", async (req, res) => {
  const userId = req.query.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user.settings);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Error fetching preferences" });
  }
});

router.put("/preferences", async (req, res) => {
  const userId = req.query.userId;
  const { image, display_name, settings } = req.body;

  let key = null;
  let backToSpotifyImg = false;

  if (image) {
    const mimeType = image.match(/data:image\/(\w+);base64,/)[1];
    const extension = mimeType === "jpeg" ? "jpeg" : "png";

    const buffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    key = `${uuidv4()}.${extension}`;

    const params = {
      Bucket: s3_bucket,
      Key: key,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: `image/${extension}`,
    };

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user._json.image?.s3key) {
        const deleteParams = {
          Bucket: s3_bucket,
          Key: user._json.image.s3key,
        };
        await s3.deleteObject(deleteParams).promise();
      }
      await s3.upload(params).promise();
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error uploading image");
    }
  }

  if (image === undefined && !display_name && !settings) {
    return res.status(400).json({ message: "No valid changes provided" });
  }

  const notifyClients = req.app.get("notifyClients");
  try {
    const user = await User.findById(userId);
    if (image === null) {
      if (user._json.image.s3key) {
        const deleteParams = {
          Bucket: s3_bucket,
          Key: user._json.image.s3key,
        };
        await s3.deleteObject(deleteParams).promise();
      }
      user._json.image.s3key = undefined;
      const friendIds = user.friends.map((f) => f.friendId);
      notifyClients(friendIds, `friendImageChanged_id=${userId}`);
    }
    if (key) {
      user._json.image.overwritten = true;
      user._json.image.s3key = key;
      const friendIds = user.friends.map((f) => f.friendId);
      notifyClients(friendIds, `friendImageChanged_id=${userId}`);
    }
    if (display_name) {
      user._json.display_name = display_name;
    }
    if (settings) {
      backToSpotifyImg = settings.useSpotifyImg && !user.settings.useSpotifyImg;
      user.settings = settings;
    }

    await user.save();

    if (image || display_name || backToSpotifyImg) {
      await Promise.all(
        user.friends.map(async (friend) => {
          const friendUser = await User.findById(friend.friendId);
          if (friendUser) {
            const userAsFriend = friendUser.friends.find(
              (f) => f.friendId === userId
            );
            if (userAsFriend) {
              if (key) userAsFriend.friendProfileImage = { s3key: key };
              if (display_name) userAsFriend.friendName = display_name;
              await friendUser.save();
            } else {
              console.error("User not found as friend:", userId);
            }
          } else {
            console.error("Friend not found:", friend.friendId);
          }
        })
      );
    }

    if (backToSpotifyImg) {
      const friendIds = user.friends.map((f) => f.friendId);
      notifyClients(friendIds, `friendImageChanged_id=${userId}`);
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return res.status(500).json({ message: "Error updating preferences" });
  }
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
