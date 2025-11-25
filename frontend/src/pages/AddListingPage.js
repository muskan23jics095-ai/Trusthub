import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

function AddListingPage() {
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState({
    purpose: "",
    propertyType: "",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    amenities: "",
    image: null,
  });

  const [token, setToken] = useState(null);

  // Get token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const handleTypeChange = (e) => {
    const { name, value } = e.target;
    setListingType({ ...listingType, [name]: value });
  };

  const handleNext = () => {
    if (listingType.purpose && listingType.propertyType) {
      setStep(2);
    } else {
      alert("Please select purpose and property type");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("You must be logged in to add a listing.");
      return;
    }

    const formData = new FormData();
    Object.keys(listingType).forEach((key) => formData.append(key, listingType[key]));
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) formData.append(key, form[key]);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/listings",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Listing added:", response.data);
      alert("Your listing has been added successfully!");

      // Reset form
      setStep(1);
      setListingType({ purpose: "", propertyType: "" });
      setForm({
        title: "",
        description: "",
        price: "",
        location: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        amenities: "",
        image: null,
      });
    } catch (error) {
      console.error("Error adding listing:", error.response || error);
      if (error.response && error.response.data) {
        alert(`Failed to add listing: ${error.response.data.error || error.response.data.msg}`);
      } else {
        alert("Failed to add listing. Please try again.");
      }
    }
  };

  return (
    <div className="add-listing-container">
      {step === 1 && (
        <div className="form-step">
          <h2 className="form-title">Step 1: Select Purpose & Property Type</h2>
          <div className="form-row">
            <label>Purpose</label>
            <select name="purpose" value={listingType.purpose} onChange={handleTypeChange} required>
              <option value="">Select Purpose</option>
              <option value="Sell">Sell</option>
              <option value="Rent">Rent</option>
            </select>
          </div>
          <div className="form-row">
            <label>Property Type</label>
            <select name="propertyType" value={listingType.propertyType} onChange={handleTypeChange} required>
              <option value="">Select Property Type</option>
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Hostel/Hotel">Hostel/Hotel Stay</option>
              <option value="Shop">Shop</option>
              <option value="Land">Land</option>
            </select>
          </div>
          <button className="submit-btn" onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 2 && (
        <form className="add-listing-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Step 2: Fill Listing Details</h2>

          <div className="form-row">
            <label>Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Enter title" required />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your property" required />
          </div>

          <div className="form-row">
            <label>Price (₹)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder={listingType.purpose === "Rent" ? "Monthly Rent" : "Sale Price"} required />
          </div>

          <div className="form-row">
            <label>Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="City, State" required />
          </div>

          {(listingType.propertyType === "Home" || listingType.propertyType === "Office") && (
            <div className="form-grid">
              <div className="form-row">
                <label>Bedrooms</label>
                <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} placeholder="Number of bedrooms" />
              </div>
              <div className="form-row">
                <label>Bathrooms</label>
                <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="Number of bathrooms" />
              </div>
              <div className="form-row">
                <label>Area (sq ft)</label>
                <input type="number" name="area" value={form.area} onChange={handleChange} placeholder="Enter area" />
              </div>
            </div>
          )}

          {listingType.propertyType === "Hostel/Hotel" && (
            <div className="form-grid">
              <div className="form-row">
                <label>Number of Rooms</label>
                <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} placeholder="Number of rooms" />
              </div>
              <div className="form-row">
                <label>Capacity per Room</label>
                <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="Capacity per room" />
              </div>
            </div>
          )}

          <div className="form-row">
            <label>Amenities</label>
            <input type="text" name="amenities" value={form.amenities} onChange={handleChange} placeholder="Pool, Parking, WiFi, etc." />
          </div>

          <div className="form-row">
            <label>Upload Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
          </div>

          <button type="submit" className="submit-btn">Add Listing</button>
        </form>
      )}
    </div>
  );
}

export default AddListingPage;
