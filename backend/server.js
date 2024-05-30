import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import passportSpotify from "passport-spotify";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import logger from "./middleware/logger.js";
import errorHandler, { notFound } from "./middleware/error.js";
import User from "./models/User.js";
import { mongoURI as db } from "./config/keys.js";

dotenv.config();
const port = process.env.PORT || 8000;

const app = express();

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(logger);

const SpotifyStrategy = passportSpotify.Strategy;

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: `http://localhost:${port}/api/auth/callback`,
    },
    (accessToken, refreshToken, expires_in, profile, done) => {
      const jwtToken = jwt.sign({ accessToken }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Make the callback function async
      (async () => {
        try {
          const user = await User.findOne({ _id: profile._json.id });

          if (user) {
            return done(null, { user, jwtToken });
          } else {
            const newUser = new User({
              _id: profile.id,
              _json: profile._json,
              friends: [],
            });

            await newUser.save();
            return done(null, { user: newUser, jwtToken });
          }
        } catch (err) {
          return done(err);
        }
      })();
    }
  )
);

// Authentication Route
app.get(
  "/api/auth",
  passport.authenticate("spotify", {
    scope: [
      " playlist-read-collaborative playlist-modify-public playlist-modify-private",
    ],
    session: false,
  })
);

// Spotify Callback Route
app.get(
  "/api/auth/callback",
  passport.authenticate("spotify", {
    session: false,
  }),
  (req, res) => {
    const userAndToken = JSON.stringify(req.user);
    const encodedUserAndToken = encodeURIComponent(userAndToken);
    res.redirect(`http://localhost:5173?userToken=${encodedUserAndToken}`);
  }
);

// Routes
// app.use("/api/auth", auth);

// Error handler
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log("Server running on port " + port));
