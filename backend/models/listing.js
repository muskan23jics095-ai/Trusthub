// models/Listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  amenities: String,
  image: String,
  purpose: String,
  propertyType: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // <--- seller reference
}, { timestamps: true });

export default mongoose.model("Listing", listingSchema);
