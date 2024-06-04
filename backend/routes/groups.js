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

router.post("/add", authenticateJWT, async (req, res) => {
  modifyGroup(req, res, "create");
});

const modifyGroup = async (req, res, action) => {
  try {
    const userId = req.user.userId;
    const groupName = req.body.groupName;
    const members = req.body.members.map((member) => {
      if (member.userId === userId) {
        return { userId: userId, status: "admin" };
      } else {
        return { userId: member.userId, status: "invited" };
      }
    });
    const playlists = req.body.playlists.map((playlist) => {
      name: playlist;
    });

    const newGroup = new Group({
      name: groupName,
      members,
      playlists,
    });
    await newGroup.save();
    let user;
    members.forEach(async (member) => {
      user = await User.findOne({ _id: member.userId });
      user.groups.push({ id: newGroup._id, status: member.status });
    });
    return json({ message: "Group created successfully" });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

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
