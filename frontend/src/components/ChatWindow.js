import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

// ✅ Connect socket globally but only once
const socket = io("http://localhost:5000", { autoConnect: false });

export default function ChatWindow({ roomId, listing, buyerId, sellerId, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!roomId) return;

    // ✅ Connect socket if not connected
    if (!socket.connected) socket.connect();

    // ✅ Join the chat room
    socket.emit("joinChat", roomId);

    // ✅ Fetch existing messages from backend
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };
    fetchMessages();

    // ✅ Listen for new messages
    socket.on("receiveMessage", (msg) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // ✅ Cleanup when component unmounts
    return () => {
      socket.emit("leaveChat", roomId);
      socket.off("receiveMessage");
    };
  }, [roomId, token]);

  // 📨 Send message
  const sendMessage = async () => {
    if (!message.trim()) return;

    const msgData = {
      roomId,
      senderId: user?._id,
      senderRole: user?.role || "buyer",
      senderName: user?.name || "User",
      receiverId: user?.role === "buyer" ? sellerId : buyerId,
      listingId: listing?._id,
      listingTitle: listing?.title,
      text: message,
      timestamp: new Date().toISOString(),
    };

    try {
      // ✅ Save to backend (DB)
      await axios.post("http://localhost:5000/api/messages", msgData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Emit real-time message
      socket.emit("sendMessage", msgData);

      // ✅ Notify receiver (real-time alert)
      socket.emit("newNotification", {
        buyerId,
        sellerId,
        buyerName: user?.name || "User",
        listingTitle: listing?.title,
        message: message,
      });

      // ✅ Instantly show in UI
      setMessages((prev) => [...prev, msgData]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "320px",
        height: "420px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      {/* 💬 Header */}
      <div
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "12px",
          textAlign: "center",
          fontWeight: "bold",
          position: "relative",
        }}
      >
        Chat — {listing?.title || ""}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "10px",
            top: "8px",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {/* 💬 Message List */}
      <div
        style={{
          flex: 1,
          padding: "10px",
          overflowY: "auto",
          background: "#f1f1f1",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "8px",
              textAlign: msg.senderId === user?._id ? "right" : "left",
            }}
          >
            <span
              style={{
                background: msg.senderId === user?._id ? "#007bff" : "#e5e5ea",
                color: msg.senderId === user?._id ? "#fff" : "#000",
                padding: "8px 12px",
                borderRadius: "16px",
                display: "inline-block",
                maxWidth: "80%",
                wordWrap: "break-word",
              }}
            >
              {msg.senderRole === "seller" ? "🟢 Seller: " : "🔵 Buyer: "}
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* ✍️ Message Input */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          borderTop: "1px solid #ccc",
          background: "#fff",
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "20px",
            padding: "8px 12px",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "8px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
