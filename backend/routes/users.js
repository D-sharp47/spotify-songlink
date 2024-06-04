import express from "express";
import User from "../models/User.js";
import { authenticateJWT } from "./auth.js";

const router = express.Router();

router.get("/search", authenticateJWT, async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const users = await User.find({}, "_id");
    const currentUserID = req.user.userId;
    let userIds = users.map((user) => user._id);
    userIds = userIds.filter((userId) => userId !== currentUserID);

    if (searchTerm) {
      const filteredUserIds = userIds.filter((userId) =>
        userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      res.json(filteredUserIds);
    } else {
      res.json(userIds);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;
