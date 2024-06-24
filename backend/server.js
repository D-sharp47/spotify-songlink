import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import dotenv from "dotenv";
import session from "express-session";
import logger from "./middleware/logger.js";
import errorHandler, { notFound } from "./middleware/error.js";
import passportConfig from "./config/passport.js";

import auth from "./routes/auth.js";
import friends from "./routes/friends.js";
import groups from "./routes/groups.js";
import users from "./routes/users.js";
import routine from "./routes/routine.js";

dotenv.config();
const port = process.env.PORT || 8000;

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day (adjust as needed)
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(logger);

passportConfig(passport);

// Routes
app.use("/api/auth", auth);
app.use("/api/friends", friends);
app.use("/api/groups", groups);
app.use("/api/users", users);
app.use("/api/routine", routine);

// Error handler
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log("Server running on port " + port));
