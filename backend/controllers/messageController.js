// controllers/messageController.js
import Message from "../models/messageModel.js";

// 📨 Send message
export const sendMessage = async (req, res) => {
  try {
    const { roomId, sender, text } = req.body;

    if (!roomId || !sender || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const msg = new Message({ roomId, sender, text });
    await msg.save();

    // Emit message in real-time if Socket.IO is available
    if (req.io) {
      req.io.to(roomId).emit("receiveMessage", msg);
    }

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
};

// 💬 Get all messages in a chat room
export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    const msgs = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};
