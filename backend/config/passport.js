import passportSpotify from "passport-spotify";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 8000;
const backendUrl = process.env.BACKEND_URL;

const SpotifyStrategy = passportSpotify.Strategy;

const passportConfig = (passport) => {
  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        callbackURL: `${backendUrl}:${port}/api/auth/callback`,
        scope: process.env.SCOPE,
      },
      async (accessToken, refreshToken, expires_in, profile, done) => {
        try {
          const user = await User.findOne({ _id: profile._json.id });

          if (user) {
            return done(null, { user, accessToken, refreshToken, expires_in });
          } else {
            const newUser = new User({
              _id: profile.id,
              _json: {
                ...profile._json,
                image: {
                  spotifyUrl: profile._json.images[1].url ?? undefined,
                  overwritten: false,
                  s3key: undefined,
                  height: 300,
                  width: 300,
                },
              },
              refreshToken,
              friends: [],
            });

            await newUser.save();
            return done(null, {
              user: newUser,
              accessToken,
              refreshToken,
              expires_in,
            });
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default passportConfig;
