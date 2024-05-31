import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import dotenv from "dotenv";
import logger from "./middleware/logger.js";
import errorHandler, { notFound } from "./middleware/error.js";
import { mongoURI as db } from "./config/keys.js";
import passportConfig from "./config/passport.js";

import auth from "./routes/auth.js";
import friends from "./routes/friends.js";

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

passportConfig(passport);

// Routes
app.use("/api/auth", auth);
app.use("/api/friends", friends);

// Error handler
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log("Server running on port " + port));
