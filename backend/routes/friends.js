import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.headers.userid;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/add", async (req, res) => {
  const friendId = req.query.friendId;
  modifyFriend(req, res, friendId, "add");
});

router.put("/accept", async (req, res) => {
  const friendId = req.query.friendId;
  modifyFriend(req, res, friendId, "accept");
});

router.delete("/remove", async (req, res) => {
  const friendId = req.query.friendId;
  modifyFriend(req, res, friendId, "remove");
});

const modifyFriend = async (req, res, friendId, action) => {
  const userId = req.headers.userid;
  const session = await User.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findOne({ _id: userId }).session(session);
      const friend = await User.findOne({ _id: friendId }).session(session);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!friend) {
        return res.status(404).json({ error: "Friend not found" });
      }

      if (action === "add") {
        if (user.friends.some((f) => f.friendId === friend._id)) {
          return res.status(400).json({ error: "Friend already added" });
        }

        user.friends.push({
          friendId: friend._id,
          friendName: friend._json.display_name ?? "No Display Name",
          friendProfileImage: friend._json.image,
          status: "req_out",
        });
        friend.friends.push({
          friendId: user._id,
          friendName: user._json.display_name,
          friendProfileImage: user._json.image,
          status: "req_in",
        });
      }

      if (action === "accept") {
        const userFriend = user.friends.find((f) => f.friendId === friend._id);
        const friendFriend = friend.friends.find(
          (f) => f.friendId === user._id
        );

        if (!userFriend || !friendFriend) {
          return res.status(400).json({ error: "Friend request not found" });
        }

        userFriend.status = "friends";
        friendFriend.status = "friends";
      }

      if (action === "remove") {
        user.friends = user.friends.filter((f) => f.friendId !== friend._id);
        friend.friends = friend.friends.filter((f) => f.friendId !== user._id);
      }

      await user.save();
      await friend.save();
      const notifyClients = req.app.get("notifyClients");
      notifyClients([userId, friend._id], "friendDataChanged");
      res.json({ message: `${user._id} ${action} Friend: ${friend._id}` });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export default router;
