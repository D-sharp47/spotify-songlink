import express from "express";
import axios from "axios";
import User from "../models/User.js";
import Group from "../models/Group.js";
import { spotifyTracks } from "./users.js";

const router = express.Router();

router.get("/updateSongs", async (req, res) => {
  try {
    const users = await User.find(
      { groups: { $exists: true, $not: { $size: 0 } } },
      "_id refreshToken groups"
    );

    const refreshedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const refreshToken = user.refreshToken;
          const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            {
              grant_type: "refresh_token",
              refresh_token: refreshToken,
              client_id: process.env.SPOTIFY_CLIENT_ID,
              client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const access_token = response.data.access_token;

          const topTracksShortTerm = await spotifyTracks(
            `Bearer ${access_token}`,
            "short_term"
          );
          const topTracksMediumTerm = await spotifyTracks(
            `Bearer ${access_token}`,
            "medium_term"
          );
          const topTracksLongTerm = await spotifyTracks(
            `Bearer ${access_token}`,
            "long_term"
          );

          await Promise.all(
            user.groups.map(async (group) => {
              try {
                const groupId = group.id; // Adjust this based on your Group model
                const groupDoc = await Group.findOne({ _id: groupId });

                if (!groupDoc) {
                  console.error(`Group not found with id ${groupId}`);
                  return null; // Handle as per your application's requirement
                }

                const songsPerMember = groupDoc.settings?.songsPerMember || 5;

                groupDoc.playlists.forEach((playlist) => {
                  if (
                    playlist.contributions.some(
                      (contribution) => contribution.userId === user._id
                    )
                  ) {
                    // If contributions for the user already exist, update them
                    playlist.contributions.forEach((contribution) => {
                      if (contribution.userId === user._id) {
                        let tracks = [];
                        if (playlist.name === "Short Term") {
                          tracks = topTracksShortTerm.slice(0, songsPerMember);
                        } else if (playlist.name === "Medium Term") {
                          tracks = topTracksMediumTerm.slice(0, songsPerMember);
                        } else if (playlist.name === "Long Term") {
                          tracks = topTracksLongTerm.slice(0, songsPerMember);
                        }
                        contribution.tracks = tracks;
                      }
                    });
                  } else {
                    // If contributions for the user do not exist, create a new one
                    let tracks = [];
                    if (playlist.name === "Short Term") {
                      tracks = topTracksShortTerm.slice(0, songsPerMember);
                    } else if (playlist.name === "Medium Term") {
                      tracks = topTracksMediumTerm.slice(0, songsPerMember);
                    } else if (playlist.name === "Long Term") {
                      tracks = topTracksLongTerm.slice(0, songsPerMember);
                    }
                    playlist.contributions.push({
                      userId: user._id,
                      tracks: tracks,
                    });
                  }
                });

                // Save the updated group document
                await groupDoc.save();
                return groupDoc;
              } catch (error) {
                console.error(`Error updating group for user `, error);
                return null; // Handle as per your application's requirement
              }
            })
          );

          return {
            _id: user._id,
            topTracksShortTerm,
            topTracksMediumTerm,
            topTracksLongTerm,
          };
        } catch (error) {
          console.error(`Error refreshing token for user ${user._id}:`, error);
          return null; // Handle error as per your application's requirement
        }
      })
    );

    res.json(refreshedUsers.filter((user) => user !== null));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default router;
