import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

export default function ListingCard({ listing, onDelete }) {
  if (!listing || !listing._id || listing._id.length !== 24) {
    console.warn("⚠️ Skipping invalid listing:", listing);
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/listings/${listing._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Listing deleted successfully!");
      if (onDelete) onDelete(listing._id); // remove from UI
    } catch (error) {
      console.error("❌ Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    }
  };

  return (
    <div className="listing-card">
      <div className="listing-image">
        <img
          src={
            listing.image
              ? `http://localhost:5000/uploads/${listing.image}`
              : "/placeholder.png"
          }
          alt={listing.title}
        />
      </div>

      <div className="listing-info">
        <h3 className="listing-title">{listing.title}</h3>
        <p className="listing-location">📍 {listing.location}</p>
        <p className="listing-price">💰 ₹{listing.price}</p>

        <div className="listing-meta">
          {listing.propertyType && <span>{listing.propertyType}</span>}
          {listing.purpose && (
            <span
              className={`listing-purpose ${
                listing.purpose === "Rent" ? "rent" : "sale"
              }`}
            >
              {listing.purpose}
            </span>
          )}
        </div>

        <div className="listing-actions">
          <Link to={`/edit-listing/${listing._id}`}>
            <button className="edit-btn">✏️ Edit</button>
          </Link>
          <button className="delete-btn" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
