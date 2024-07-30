import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import dotenv from "dotenv";
import session from "express-session";
import http from "http";
import { WebSocketServer } from "ws";
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
const host = "0.0.0.0";
const frontendUrl = process.env.FRONTEND_URL;
const dbName = process.env.DB_NAME;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { dbName })
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
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(logger);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", frontendUrl);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, userid, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "3600");
  next();
});

passportConfig(passport);

// WebSocket setup
const clients = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, userId } = parsedMessage;
      if (type === "register" && parsedMessage.userId) {
        const userId = parsedMessage.userId;
        clients.set(userId, ws);
        console.log(`Registered user: ${userId}`);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    // Clean up disconnected clients
    for (let [userId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
        break;
      }
    }
  });
});

const notifyClients = (userIds, message) => {
  userIds.forEach((userId) => {
    const client = clients.get(userId);
    if (client && client._readyState === 1) {
      client.send(JSON.stringify({ message }));
      console.log("Notified client", userId, message);
    }
  });
};

app.set("notifyClients", notifyClients);

app.get("/api/status", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", auth);
app.use("/api/friends", friends);
app.use("/api/groups", groups);
app.use("/api/users", users);
app.use("/api/routine", routine);

// Error handler
app.use(notFound);
app.use(errorHandler);

server.listen(port, host, () =>
  console.log(`Server running on https://${host}:${port}`)
);
