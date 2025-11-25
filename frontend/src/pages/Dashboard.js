import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import ChatWindow from "../components/ChatWindow";
import "../App.css";

// ✅ Connect socket
const socket = io("http://localhost:5000", { autoConnect: false });

export default function Dashboard() {
  const [notifications, setNotifications] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [listings, setListings] = useState([]);
  const [newMessages, setNewMessages] = useState({});
  const [hasNewNotif, setHasNewNotif] = useState(false);

  const seller = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // 🧭 Load data when seller logs in
  useEffect(() => {
    if (!seller?._id) return;

    // 🔗 Connect socket for real-time updates
    if (!socket.connected) {
      socket.connect();
      socket.emit("joinChat", seller._id); // Use seller ID as private room for notifications
    }

    // Fetch existing notifications from DB
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/notifications/${seller._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    // Fetch listings created by seller
    const fetchListings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/listings/seller/my-listings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setListings(res.data || []);
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    };

    fetchNotifications();
    fetchListings();

    // 🔔 Listen for real-time notifications
    socket.on("newNotification", (notif) => {
      // Ensure notification belongs to this seller
      if (notif.sellerId === seller._id) {
        setNotifications((prev) => [notif, ...prev]);
        setHasNewNotif(true);
      }
    });

    // 💬 Listen for new chat messages
    socket.on("receiveMessage", (msg) => {
      setNewMessages((prev) => ({
        ...prev,
        [msg.sender]: (prev[msg.sender] || 0) + 1,
      }));
      setHasNewNotif(true);
    });

    return () => {
      socket.off("newNotification");
      socket.off("receiveMessage");
    };
  }, [seller, token]);

  // 🗨️ Open chat window
  const handleOpenChat = (notif) => {
    setSelectedChat({
      roomId: notif.roomId || `${notif.buyerId}_${seller._id}`,
      listing: { title: notif.listingTitle || "Listing" },
      buyerId: notif.buyerId,
    });
    setChatOpen(true);
    setNewMessages((prev) => ({ ...prev, [notif.buyerId]: 0 }));
    setHasNewNotif(false);
  };

  // ❌ Close chat
  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedChat(null);
  };

  // 🗑 Delete a listing
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`http://localhost:5000/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings((prev) => prev.filter((l) => l._id !== id));
        alert("✅ Listing deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        alert("❌ Failed to delete listing");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Seller Dashboard</h1>
      <p className="dashboard-subtitle">
        Manage your listings, chats & customer notifications easily.
      </p>

      {/* Dashboard Buttons */}
      <div className="dashboard-buttons">
        <Link to="/add-listing" className="dashboard-btn">
          ➕ Add New Listing
        </Link>
        <Link to="/view-listings" className="dashboard-btn">
          📋 View Listings
        </Link>
      </div>

      {/* Seller Listings */}
      {listings.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px", color: "#333" }}>📦 Your Listings</h2>
          <div style={{ marginTop: "20px" }}>
            {listings.map((listing) => (
              <div
                key={listing._id}
                style={{
                  background: "#fff",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <b>{listing.title}</b> — ₹{listing.price}
                </div>
                <button
                  onClick={() => handleDelete(listing._id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px", color: "#333" }}>
            📩 Notifications{" "}
            {hasNewNotif && <span style={{ color: "red" }}>● New</span>}
          </h2>
          <div style={{ marginTop: "20px" }}>
            {notifications.map((notif, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {notif.type === "buy_request" ? (
                    <>
                      🛒 Buyer (<strong>{notif.buyerId}</strong>) wants to buy
                      your product.
                    </>
                  ) : (
                    <>
                      💬 New chat message from buyer{" "}
                      <strong>{notif.buyerId}</strong>
                    </>
                  )}
                  {newMessages[notif.buyerId] > 0 && (
                    <span style={{ color: "red", marginLeft: "6px" }}>
                      ({newMessages[notif.buyerId]} new msg)
                    </span>
                  )}
                </div>
                {notif.type === "chat_message" && (
                  <button
                    onClick={() => handleOpenChat(notif)}
                    style={{
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    💬 Open Chat
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Chat Window */}
      {chatOpen && selectedChat && (
        <ChatWindow
          roomId={selectedChat.roomId}
          listing={selectedChat.listing}
          buyerId={selectedChat.buyerId}
          sellerId={seller._id}
          onClose={handleCloseChat}
          socket={socket}
        />
      )}
    </div>
  );
}
