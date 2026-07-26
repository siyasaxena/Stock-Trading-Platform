const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// Verify Authentication
const verifyToken = (req, res, next) => {
  // Read token from cookies or Authorization header ("Bearer <token>")
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No Token Provided" });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach payload (id, role) to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

// Check Authorization (Role-based access control)
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access Denied" });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };
