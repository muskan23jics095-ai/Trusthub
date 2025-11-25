import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded images publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------- ROUTES -------------------
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listingRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/messages", messageRoutes);

// ------------------------------------------------
// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ Define Schemas
const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const notificationSchema = new mongoose.Schema({
  sellerId: { type: String, required: true },
  buyerId: { type: String, required: true },
  listingId: { type: String },
  type: { type: String, enum: ["buy_request", "chat_message"], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

// ✅ Create HTTP Server (for Socket.IO)
const server = createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Attach io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ SOCKET.IO HANDLERS
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join a chat room
  socket.on("joinChat", (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined chat room: ${roomId}`);
  });

  // Handle incoming chat messages
  socket.on("sendMessage", async (msg) => {
    console.log("📩 Message received:", msg);

    try {
      const newMsg = new Message(msg);
      await newMsg.save();

      // Emit to both buyer & seller
      io.to(msg.roomId).emit("receiveMessage", msg);

      // 🔔 Notify seller when buyer sends message
      if (msg.sender === "buyer") {
        const [buyerId, sellerId] = msg.roomId.split("_");

        const notif = new Notification({
          buyerId,
          sellerId,
          type: "chat_message",
          message: "New message from Buyer in chat for your listing",
        });
        await notif.save();

        io.emit("newNotification", {
          type: "chat_message",
          sellerId,
          buyerId,
          roomId: msg.roomId,
          message: "New message from Buyer in chat for your listing",
          timestamp: msg.timestamp,
        });
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle leaving room
  socket.on("leaveChat", (roomId) => {
    socket.leave(roomId);
    console.log(`🚪 User ${socket.id} left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ “BUY NOW” Route (real-time + DB notification)
app.post("/api/buy", async (req, res) => {
  try {
    const { buyerId, sellerId, listingId } = req.body;

    const notif = new Notification({
      buyerId,
      sellerId,
      listingId,
      type: "buy_request",
      message: "A customer wants to buy your product.",
    });

    await notif.save();

    // Emit real-time to seller
    io.emit("newNotification", {
      type: "buy_request",
      sellerId,
      buyerId,
      listingId,
      message: "A customer wants to buy your product.",
    });

    res.json({ success: true, message: "Buy request sent successfully" });
  } catch (err) {
    console.error("Error handling buy request:", err);
    res.status(500).json({ success: false, message: "Error sending request" });
  }
});

// ✅ Get all notifications for seller
app.get("/api/notifications/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const notifs = await Notification.find({ sellerId }).sort({ timestamp: -1 });
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
