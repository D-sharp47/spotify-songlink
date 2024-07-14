import express from "express";
import User from "../models/User.js";
import Group from "../models/Group.js";
import { updateSongs } from "./routine.js";

const router = express.Router();

router.get("/", async (req, res) => {
  getGroups(req, res);
});

router.get("/detail", async (req, res) => {
  const groupId = req.query.groupId;
  getGroup(req, res, groupId);
});

router.post("/create", async (req, res) => {
  const result = await createGroup(req, res);
});

router.delete("/delete", async (req, res) => {
  const groupId = req.query.groupId;
  const result = await deleteGroup(req, res, groupId);
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
    console.error("Error fetching groups:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createGroup = async (req, res) => {
  try {
    const accessToken = req.headers.authorization;
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

    const settings = {
      songsPerMember: req.body.settings?.songsPerMember || 5,
      enabled: req.body.settings?.enabled || true,
    };

    const newGroup = new Group({
      name: groupName,
      creatorId: userId,
      members,
      playlists,
      settings,
    });
    await newGroup.save();

    const groupId = newGroup._id.toString();

    for (const member of members) {
      const user = await User.findOne({ _id: member.userId });
      user.groups.push({ id: groupId, status: member.status });
      await user.save();
    }

    await updateSongs(accessToken, userId, groupId);

    const notifyClients = req.app.get("notifyClients");
    const userIds = members
      .map((member) => member.userId)
      .filter((id) => id !== userId);
    notifyClients(userIds, "groupDataChanged");
    return res.json({ message: "Group created successfully", members });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteGroup = async (req, res, groupId) => {
  try {
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const userId = req.headers.userid;

    if (group.creatorId !== userId) {
      leaveGroup(req, res, groupId);
      return;
    }

    const groupMembers = group.members.map((member) => member.userId);
    await Group.deleteOne({ _id: groupId });
    for (const member of groupMembers) {
      const user = await User.findOne({ _id: member });
      user.groups = user.groups.filter((group) => group.id !== groupId);
      await user.save();
    }

    const notifyClients = req.app.get("notifyClients");
    notifyClients(
      groupMembers.filter((id) => id !== userId),
      "groupDataChanged"
    );
    return res.json({
      message: "Group deleted successfully",
      members: groupMembers,
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const leaveGroup = async (req, res, groupId) => {
  try {
    const userId = req.headers.userid;
    const user = await User.find({ _id: userId });
    const group = await Group.find({ _id: groupId });
    group.members = group.members.filter((member) => member.userId !== userId);
    user.groups = user.groups.filter((group) => group.id !== groupId);
    await group.save();
    await user.save();
    const notifyClients = req.app.get("notifyClients");
    notifyClients(
      groupMembers.filter((id) => id !== userId),
      "groupDataChanged"
    );
    return res.json({ message: "Group left successfully" });
  } catch (error) {
    console.error("Error leaving group:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default router;
