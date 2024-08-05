import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

const app = express();

dotenv.config();

const port = process.env.PORT || 5000;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = `http://localhost:${port}/callback`;

// Routes
app.get("/", (req, res) => {
  const scopes =
    " playlist-read-collaborative playlist-modify-public playlist-modify-private";
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const accessToken = await getAccessToken(code);
    const playlists = await getUserPlaylists(accessToken);
    const onRepeatPlaylist = findOnRepeatPlaylist(playlists);
    let tracks;
    if (onRepeatPlaylist) {
      tracks = await getPlaylistTracks(accessToken, onRepeatPlaylist.id, 5);
    } else {
      tracks = await getTopTracks(accessToken, 5);
    }
    console.log(
      "Top tracks:",
      tracks.map((track) => track.name)
    );
    res.send("Check the console for top tracks!");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred.");
  }
});

// Functions
async function getAccessToken(code) {
  const bodyParams = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
  });
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: bodyParams.toString(),
  });
  const data = await response.json();
  return data.access_token;
}

async function getUserPlaylists(accessToken) {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.items;
}

function findOnRepeatPlaylist(playlists) {
  return playlists.find(
    (playlist) =>
      playlist.name.toLowerCase() === "on repeat" &&
      playlist.owner.id === "spotify"
  );
}

async function getPlaylistTracks(accessToken, playlistId, limit) {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  return data.items.map((item) => item.track);
}

async function getTopTracks(accessToken, limit) {
  const response = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  return data.items;
}

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
