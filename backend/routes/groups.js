import express from "express";
import User from "../models/User.js";
import Group from "../models/Group.js";
import { authenticateJWT } from "./auth.js";

const router = express.Router();

router.get("/", authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const groups = await getGroups(user.groups);
    return res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const getGroups = async (userGroups) => {
  try {
    const groupIds = userGroups.map((group) => group.id);
    const groups = await Group.find({ _id: { $in: groupIds } });

    return groups;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

export default router;
