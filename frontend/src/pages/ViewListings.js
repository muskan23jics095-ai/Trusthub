import React, { useEffect, useState } from "react";
import axios from "axios";
import ListingCard from "./ListingCard";
import "../App.css";

export default function ViewListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerListings = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please log in first!");
          return;
        }

        // ✅ Fetch only this seller's listings
        const res = await axios.get(
          "http://localhost:5000/api/listings/seller/my-listings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setListings(res.data);
      } catch (err) {
        console.error("Error fetching seller listings:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerListings();
  }, []);

  // 🗑️ Remove deleted listing from UI instantly
  const handleDeleteListing = (id) => {
    setListings((prev) => prev.filter((listing) => listing._id !== id));
  };

  return (
    <div className="view-listings-container">
      {/* Top header section */}
      <div className="listings-header">
        <h1>🏠 My Property Listings</h1>
        <p>View and manage all the listings you’ve created.</p>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076509.png"
            alt="No listings"
          />
          <h3>No Listings Found</h3>
          <p>You haven’t added any listings yet. Start by creating one!</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onDelete={handleDeleteListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
