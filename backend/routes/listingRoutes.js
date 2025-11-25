import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------------------------------------
   🗂️ Ensure uploads folder exists
--------------------------------------------- */
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

/* ---------------------------------------------
   🖼️ Configure Multer for image uploads
--------------------------------------------- */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

/* ---------------------------------------------
   🌍 PUBLIC ROUTE — Fetch all listings (for buyers)
--------------------------------------------- */
router.get("/", getListings);

/* ---------------------------------------------
   👩‍💼 SELLER ROUTE — Fetch only that seller's listings
--------------------------------------------- */
router.get("/seller/my-listings", protect, async (req, res) => {
  try {
    const { default: Listing } = await import("../models/listing.js");
    const listings = await Listing.find({ seller: req.userId }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ---------------------------------------------
   🔒 PROTECTED ROUTES — Require authentication
--------------------------------------------- */

// ➕ Add new listing
router.post("/", protect, upload.single("image"), createListing);

// 🔍 Get single listing by ID
router.get("/:id", protect, getListingById);

// ✏️ Update existing listing
router.put("/:id", protect, upload.single("image"), updateListing);

// 🗑️ Delete listing (only by the owner)
router.delete("/:id", protect, deleteListing);

export default router;
