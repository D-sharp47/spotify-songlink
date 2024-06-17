import express from "express";
import User from "../models/User.js";
import Group from "../models/Group.js";
// import { ensureAuthenticated } from "./auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  getGroups(req, res);
});

router.get("/:groupId", async (req, res) => {
  const groupId = req.params.groupId;
  getGroup(req, res, groupId);
});

router.post("/create", async (req, res) => {
  createGroup(req, res);
});

router.post("/:groupId/update", async (req, res) => {
  const groupId = req.params.groupId;
  updateGroup(req, res, groupId);
});

router.delete("/:groupId/delete", async (req, res) => {
  const groupId = req.params.groupId;
  deleteGroup(req, res, groupId);
});

const getGroup = async (req, res, groupId) => {
  try {
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    return res.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getGroups = async (req, res) => {
  const userId = req.headers.userid;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const groupIds = user.groups.map((group) => group.id);
    const groups = await Group.find({ _id: { $in: groupIds } });

    return res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createGroup = async (req, res) => {
  try {
    const userId = req.headers.userid;
    const groupName = req.body.name;
    const members = req.body.members.map((member) => {
      if (member === userId) {
        return { userId: member, status: "admin" };
      } else {
        return { userId: member, status: "invited" };
      }
    });
    const playlistNames = req.body.playlists;
    const playlists = playlistNames.map((name) => ({
      name: name,
    }));

    const newGroup = new Group({
      name: groupName,
      members,
      playlists,
    });
    await newGroup.save();

    const groupId = newGroup._id.toString();

    for (const member of members) {
      const user = await User.findOne({ _id: member.userId });
      user.groups.push({ id: groupId, status: member.status });
      await user.save();
    }

    return res.json({ message: "Group created successfully" });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateGroup = async (req, res, groupId) => {};

const deleteGroup = async (req, res, groupId) => {
  try {
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupMembers = group.members.map((member) => member.userId);
    await Group.deleteOne({ _id: groupId });
    for (const member of groupMembers) {
      const user = await User.findOne({ _id: member });
      user.groups = user.groups.filter((group) => group.id !== groupId);
      await user.save();
    }

    return res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default router;
