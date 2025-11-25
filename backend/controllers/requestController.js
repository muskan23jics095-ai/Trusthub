import Request from "../models/Request.js";
import Listing from "../models/listing.js";

// 🔹 Buyer sends purchase request
export const sendRequest = async (req, res) => {
  try {
    const { listingId, sellerId } = req.body;
    const buyerId = req.user._id;

    // prevent duplicate requests
    const existing = await Request.findOne({ listing: listingId, buyer: buyerId });
    if (existing) {
      return res.status(400).json({ message: "Request already sent for this listing" });
    }

    const newRequest = new Request({
      buyer: buyerId,
      seller: sellerId,
      listing: listingId,
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json({ message: "Request sent successfully", request: newRequest });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to send request" });
  }
};

// 🔹 Seller fetches all requests (notifications)
export const getSellerNotifications = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const requests = await Request.find({ seller: sellerId })
      .populate("buyer", "name email")
      .populate("listing", "title price");

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching seller notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// 🔹 Seller approves or rejects a request
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // "approved" or "rejected"
    const sellerId = req.user._id;

    const request = await Request.findById(requestId).populate("listing");
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    request.status = status;
    await request.save();

    // if approved, mark listing as sold and assign buyer
    if (status === "approved") {
      request.listing.isSold = true;
      request.listing.buyer = request.buyer;
      await request.listing.save();
    }

    res.status(200).json({ message: `Request ${status} successfully`, request });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

// 🔹 Buyer’s purchased (approved) items
export const getBuyerAssets = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const requests = await Request.find({ buyer: buyerId, status: "approved" })
      .populate("listing", "title description price");

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
};

// 🔹 Seller’s sold items
export const getSellerSoldItems = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const requests = await Request.find({ seller: sellerId, status: "approved" })
      .populate("listing", "title description price");

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sold items" });
  }
};
