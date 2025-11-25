import express from "express";
import {
  sendRequest,
  getSellerNotifications,
  updateRequestStatus,
  getBuyerAssets,
  getSellerSoldItems,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Buyer sends a purchase request
router.post("/send", protect, sendRequest);

// 🔹 Seller fetches all incoming requests (notifications)
router.get("/notifications", protect, getSellerNotifications);

// 🔹 Seller approves or rejects a request
router.put("/update/:requestId", protect, updateRequestStatus);

// 🔹 Buyer views approved items (Assets)
router.get("/buyer/assets", protect, getBuyerAssets);

// 🔹 Seller views sold items
router.get("/seller/sold", protect, getSellerSoldItems);

export default router;
