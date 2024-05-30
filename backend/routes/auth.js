import express from "express";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();
const port = process.env.PORT || 5000;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = `http://localhost:${port}/api/auth/callback`;

const getAuth = (req, res) => {
  const scopes =
    "playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private";
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
};

const getAccessToken = async (code) => {
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
};

router.get("/", getAuth);

router.get("/callback", async (req, res) => {
  const code = req.query.code;
  const token = await getAccessToken(code);
  res.json({ token });
});

export default router;
