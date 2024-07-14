import express from "express";
import axios, { AxiosError } from "axios";
import User from "../models/User.js";
import Group from "../models/Group.js";
import {
  removeTracksFromPlaylist,
  setUserDataPlaylist,
  spotifyTracks,
} from "./users.js";

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
          const accessToken = await getAccessTokenFromRefresh(refreshToken);

          if (!accessToken) {
            throw new Error(
              `Unable to refresh access token for user ${user._id}`
            );
          }

          const topTracksShortTerm = await spotifyTracks(
            `Bearer ${accessToken}`,
            "short_term"
          );
          setUserDataPlaylist(
            accessToken,
            user._id,
            "Top Songs Short Term",
            topTracksShortTerm,
            true
          );

          const topTracksMediumTerm = await spotifyTracks(
            `Bearer ${accessToken}`,
            "medium_term"
          );
          setUserDataPlaylist(
            accessToken,
            user._id,
            "Top Songs Medium Term",
            topTracksMediumTerm,
            true
          );

          const topTracksLongTerm = await spotifyTracks(
            `Bearer ${accessToken}`,
            "long_term"
          );
          setUserDataPlaylist(
            accessToken,
            user._id,
            "Top Songs Long Term",
            topTracksLongTerm,
            true
          );

          await Promise.all(
            user.groups.map(async (group) => {
              try {
                const groupDoc = await Group.findById(group.id);
                if (!groupDoc) {
                  throw new Error(`Group not found with id ${group.id}`);
                }

                const creator = await User.findById(groupDoc.creatorId);
                const creatorAccessToken = await getAccessTokenFromRefresh(
                  creator.refreshToken
                );

                if (!creatorAccessToken) {
                  throw new Error(
                    `Unable to refresh access token for creator ${creator._id}`
                  );
                }

                const songsPerMember = groupDoc.settings.songsPerMember;

                for (const playlist of groupDoc.playlists) {
                  const userContribution = playlist.contributions.find(
                    (contribution) => contribution.userId === user._id
                  );

                  if (!playlist.created) {
                    const { playlist_id, snapshot_id } = await createPlaylist(
                      creatorAccessToken,
                      groupDoc.creatorId,
                      `${groupDoc.name} - ${playlist.name}`
                    );

                    playlist.playlistId = playlist_id;
                    playlist.snapshotId = snapshot_id;
                    playlist.created = true;
                  }

                  const isFollowing = playlist.followers.includes(user._id);
                  if (user._id !== creator._id && !isFollowing) {
                    await axios.put(
                      `https://api.spotify.com/v1/playlists/${playlist.playlistId}/followers`,
                      {
                        public: true,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${accessToken}`,
                          "Content-Type": "application/json",
                        },
                      }
                    );
                    playlist.followers.push(user._id);
                    console.log(
                      user._id,
                      " followed ",
                      groupDoc.name,
                      " playlist ",
                      playlist.name
                    );
                  }

                  if (
                    topTracksShortTerm.length +
                      topTracksMediumTerm.length +
                      topTracksLongTerm.length ===
                    0
                  ) {
                    return;
                  }

                  if (playlist.created) {
                    const prevTracks = userContribution?.tracks ?? [];
                    removeTracksFromPlaylist(
                      accessToken,
                      playlist.playlistId,
                      prevTracks
                    );
                  }

                  if (userContribution) {
                    const tracks = getTracksByPlaylistName(
                      playlist.name,
                      topTracksShortTerm,
                      topTracksMediumTerm,
                      topTracksLongTerm,
                      songsPerMember
                    );

                    userContribution.tracks = tracks;
                    await addTracksToPlaylist(
                      accessToken,
                      playlist.playlistId,
                      tracks
                    );
                  } else {
                    const tracks = getTracksByPlaylistName(
                      playlist.name,
                      topTracksShortTerm,
                      topTracksMediumTerm,
                      topTracksLongTerm,
                      songsPerMember
                    );

                    playlist.contributions.push({
                      userId: user._id,
                      tracks: tracks,
                    });

                    await addTracksToPlaylist(
                      accessToken,
                      playlist.playlistId,
                      tracks
                    );
                  }
                }

                const MAX_RETRIES = 3;
                const RETRY_DELAY_MS = 1000; // 1 second delay between retries
                let retryCount = 0;

                while (retryCount < MAX_RETRIES) {
                  try {
                    await groupDoc.save();
                    break;
                  } catch (error) {
                    retryCount++;
                    if (retryCount < MAX_RETRIES) {
                      console.log(
                        `Retrying operation (attempt ${retryCount})...`
                      );
                      await new Promise((resolve) =>
                        setTimeout(resolve, RETRY_DELAY_MS)
                      );
                    }
                  }
                }
              } catch (error) {
                console.error(
                  `Error updating group ${group.id} for user ${user._id}:`,
                  error
                );
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
          console.error(`Error processing user ${user._id}:`, error);
          return null;
        }
      })
    );

    res.json(refreshedUsers.filter((user) => user !== null));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export const getAccessTokenFromRefresh = async (refreshToken) => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

export const createPlaylist = async (accessToken, userId, playlistName) => {
  try {
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName,
        public: false,
        collaborative: true,
        description: "Playlist created by SongLink",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      playlist_id: response.data.id,
      snapshot_id: response.data.snapshot_id,
    };
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
};

export const addTracksToPlaylist = async (accessToken, playlistId, tracks) => {
  try {
    if (tracks.length === 0) {
      console.log("No tracks to add to playlist");
      return;
    }

    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        uris: tracks,
        position: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    // console.error("Error adding tracks to playlist:", error);
  }
};

const getTracksByPlaylistName = (
  playlistName,
  shortTerm,
  mediumTerm,
  longTerm,
  limit
) => {
  switch (playlistName) {
    case "Short Term":
      return shortTerm.slice(0, limit);
    case "Medium Term":
      return mediumTerm.slice(0, limit);
    case "Long Term":
      return longTerm.slice(0, limit);
    default:
      return [];
  }
};

export default router;
