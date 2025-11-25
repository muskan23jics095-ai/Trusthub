import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      if (!id || id.length !== 24) {
        alert("Invalid listing ID.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please log in first.");
          return;
        }

        console.log("Fetching listing for ID:", id);
        const res = await axios.get(`http://localhost:5000/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched listing:", res.data);

        // Handle both { listing: {...} } or direct {...}
        const listing = res.data.listing ? res.data.listing : res.data;

        setForm({
          title: listing.title || "",
          description: listing.description || "",
          price: listing.price || "",
          location: listing.location || "",
          bedrooms: listing.bedrooms || "",
          bathrooms: listing.bathrooms || "",
          area: listing.area || "",
          amenities: listing.amenities || "",
        });

        if (listing.image) {
          setPreview(`http://localhost:5000/uploads/${listing.image}`);
        }
      } catch (error) {
        console.error("❌ Error fetching listing:", error.response || error);
        alert("Failed to fetch listing details. Please check backend logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // ✅ Handle text and image input
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image" && files && files[0]) {
      setImage(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Submit updated listing
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to update a listing.");
        return;
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (image) formData.append("image", image);

      const res = await axios.put(
        `http://localhost:5000/api/listings/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Update success:", res.data);
      alert("Listing updated successfully!");
      navigate("/view-listings");
    } catch (error) {
      console.error("❌ Error updating listing:", error.response || error);
      if (error.response?.data?.message) {
        alert(`Failed to update: ${error.response.data.message}`);
      } else {
        alert("Failed to update listing. Please try again.");
      }
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading listing details...</p>;
  }

  return (
    <div className="add-listing-container">
      <h2 className="form-title">Edit Your Listing</h2>

      <form className="add-listing-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label>Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            value={form.bedrooms || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            value={form.bathrooms || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Area (sq ft)</label>
          <input
            type="number"
            name="area"
            value={form.area || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Amenities</label>
          <input
            type="text"
            name="amenities"
            value={form.amenities || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Change Image (optional)</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
        </div>

        {preview && (
          <div className="form-row">
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: "250px", borderRadius: "8px", marginTop: "10px" }}
            />
          </div>
        )}

        <button type="submit" className="submit-btn">
          Update Listing
        </button>
      </form>
    </div>
  );
}
