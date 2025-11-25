import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";

export default function CustomerDashboard() {
  const [listings, setListings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedListing, setSelectedListing] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")); // Logged-in buyer

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/listings");
        const data = Array.isArray(res.data) ? res.data : res.data.listings;
        setListings(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const delayFilter = setTimeout(() => {
      const q = search.toLowerCase();
      const result = listings.filter(
        (listing) =>
          listing.title?.toLowerCase().includes(q) ||
          listing.description?.toLowerCase().includes(q) ||
          listing.location?.toLowerCase().includes(q) ||
          String(listing.price)?.includes(q)
      );
      setFiltered(result);
    }, 300);
    return () => clearTimeout(delayFilter);
  }, [search, listings]);

  const handleBuy = (listing) => {
    alert(`You selected to buy: ${listing.title}`);
  };

  const handleContactSeller = (listing) => {
    const buyerId = user?._id || "guest";
    const sellerId = listing.sellerId || listing.ownerId || "unknown";
    const roomId = `${buyerId}_${sellerId}_${listing._id}`;

    setSelectedListing({ ...listing, roomId, sellerId });
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedListing(null);
  };

  return (
    <div style={{ padding: "40px 20px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "2rem", color: "#333" }}>
        🏡 Explore Available Listings
      </h2>

      {/* Search Bar */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search homes, offices, rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "12px 16px",
            width: "70%",
            maxWidth: "600px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "16px",
            outline: "none",
          }}
        />
      </div>

      {/* Listing Cards */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading listings...</p>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: "center" }}>No listings found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
            justifyItems: "center",
          }}
        >
          {filtered.map((listing) => (
            <div
              key={listing._id}
              style={{
                background: "#fff",
                borderRadius: "15px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                overflow: "hidden",
                width: "100%",
                maxWidth: "350px",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={{ width: "100%", height: "220px", overflow: "hidden" }}>
                <img
                  src={
                    listing.image
                      ? `http://localhost:5000/uploads/${listing.image}`
                      : "https://via.placeholder.com/350x220?text=No+Image"
                  }
                  alt={listing.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ padding: "18px 20px" }}>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "8px", color: "#222", textTransform: "capitalize" }}>
                  {listing.title || "Untitled Listing"}
                </h3>
                <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "10px", minHeight: "40px" }}>
                  {listing.description || "No description available."}
                </p>
                <p style={{ color: "#000", fontWeight: "bold", fontSize: "1.1rem", marginBottom: "5px" }}>
                  ₹{listing.price || "N/A"}
                </p>
                <p style={{ color: "#555", marginBottom: "15px" }}>📍 {listing.location || "Location not specified"}</p>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => handleBuy(listing)}
                    style={{
                      flex: 1,
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 0",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => handleContactSeller(listing)}
                    style={{
                      flex: 1,
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 0",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <ChatWindow roomId={selectedListing.roomId} listing={selectedListing} onClose={handleCloseChat} />
      )}
    </div>
  );
}
