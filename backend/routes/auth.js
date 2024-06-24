import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import axios from "axios";

const router = express.Router();
dotenv.config();

// Authentication Route
router.get(
  "/",
  passport.authenticate("spotify", {
    scope: process.env.SCOPE,
  })
);

// Spotify Callback Route
router.get(
  "/callback",
  passport.authenticate("spotify", {
    session: false,
  }),
  (req, res) => {
    const { user, accessToken, refreshToken, expires_in } = req.user;
    const userAndTokens = {
      user: user,
      tokens: { accessToken, refreshToken, expires_in },
    };
    const encodedUserAndTokenString = encodeURIComponent(
      JSON.stringify(userAndTokens)
    );
    res.redirect(
      `http://localhost:5173?userToken=${encodedUserAndTokenString}`
    );
  }
);

router.post("/refresh", async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token not provided" });
  }

  try {
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

    const { access_token, expires_in } = response.data;

    res.json({ access_token, expires_in });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
};

export default router;
