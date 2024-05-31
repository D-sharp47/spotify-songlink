import express from "express";
import { authenticateJWT } from "./auth.js";

const router = express.Router();

router.post("/add/:id", authenticateJWT, (req, res) => {
  const id = req.params.id;
  const userId = req.user.userId;
  res.json({ message: `${userId} Added Friend: ${id}` });
});

export default router;
