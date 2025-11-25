import Listing from "../models/listing.js";

/* ────────────────────────────────────────────────
   ➕ Create a New Listing
──────────────────────────────────────────────── */
export const createListing = async (req, res) => {
  try {
    const listing = new Listing({
      ...req.body,
      seller: req.userId, // Added from protect middleware
      image: req.file ? req.file.filename : null,
    });

    await listing.save();

    res.status(201).json({
      success: true,
      message: "Listing created successfully!",
      listing,
    });
  } catch (err) {
    console.error("❌ Error creating listing:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create listing.",
      error: err.message,
    });
  }
};

/* ────────────────────────────────────────────────
   📋 Get Listings
   → Sellers see their own listings
   → Customers/public see all
──────────────────────────────────────────────── */
export const getListings = async (req, res) => {
  try {
    let listings = [];

    if (req.userRole === "seller") {
      listings = await Listing.find({ seller: req.userId }).sort({ createdAt: -1 });
    } else {
      listings = await Listing.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      message: "Listings fetched successfully.",
      count: listings.length,
      listings,
    });
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listings.",
      error: err.message,
    });
  }
};

/* ────────────────────────────────────────────────
   📦 Get Single Listing by ID
──────────────────────────────────────────────── */
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    // Seller access check
    if (req.userRole === "seller" && listing.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This listing doesn't belong to you.",
      });
    }

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (err) {
    console.error("❌ Error fetching listing:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listing.",
      error: err.message,
    });
  }
};

/* ────────────────────────────────────────────────
   ✏️ Update Listing (Sellers only)
──────────────────────────────────────────────── */
// ✏️ Update Listing (Sellers only)
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    // Check ownership
    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own listings.",
      });
    }

    // ✅ Prepare updated data
    const updatedData = {
      title: req.body.title || listing.title,
      location: req.body.location || listing.location,
      price: req.body.price || listing.price,
      description: req.body.description || listing.description,
      propertyType: req.body.propertyType || listing.propertyType,
      purpose: req.body.purpose || listing.purpose,
    };

    if (req.file) {
      updatedData.image = req.file.filename; // update image only if new one uploaded
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Listing updated successfully!",
      updatedListing,
    });
  } catch (err) {
    console.error("❌ Error updating listing:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update listing.",
      error: err.message,
    });
  }
};


/* ────────────────────────────────────────────────
   ❌ Delete Listing (Sellers only)
──────────────────────────────────────────────── */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You cannot delete this listing.",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (err) {
    console.error("❌ Error deleting listing:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete listing.",
      error: err.message,
    });
  }
};

/* ────────────────────────────────────────────────
   🧾 Get All Listings for Current Seller (For Dashboard)
──────────────────────────────────────────────── */
export const getSellerListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Seller listings fetched successfully.",
      listings,
    });
  } catch (err) {
    console.error("❌ Error fetching seller listings:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller listings.",
      error: err.message,
    });
  }
};
