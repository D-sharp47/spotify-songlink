import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

const router = express.Router();
dotenv.config();

// Authentication Route
router.get(
  "/",
  passport.authenticate("spotify", {
    scope: [
      " playlist-read-collaborative playlist-modify-public playlist-modify-private",
    ],
    session: false,
  })
);

// Spotify Callback Route
router.get(
  "/callback",
  passport.authenticate("spotify", {
    session: false,
  }),
  (req, res) => {
    const userAndToken = JSON.stringify(req.user);
    const encodedUserAndToken = encodeURIComponent(userAndToken);
    res.redirect(`http://localhost:5173?userToken=${encodedUserAndToken}`);
  }
);

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers.userid;

  if (authHeader && userIdHeader) {
    const token = authHeader;
    const userId = userIdHeader;

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.sendStatus(403); // Forbidden
      }

      req.user = {
        userId: userId,
        token: token,
      };
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

export default router;
