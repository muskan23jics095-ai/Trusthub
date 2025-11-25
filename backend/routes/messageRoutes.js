import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

// 📨 Send a message (buyer/seller)
router.post("/", sendMessage);

// 💬 Get all messages for a specific chat room
router.get("/", getMessages);

export default router;
