// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token found
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to request
    req.userId = decoded.id || decoded._id;

    req.userRole = decoded.role;

    // Continue to next middleware
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};
