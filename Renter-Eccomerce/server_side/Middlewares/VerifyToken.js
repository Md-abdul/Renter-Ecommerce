// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");

// dotenv.config();
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// // Middleware to verify JWT Token
// const verifyToken = (req, res, next) => {
//   const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Access Denied. No token provided." });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded; // Attach decoded user ID to request object
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: "Invalid or expired token." });
//   }
// };

// module.exports = { verifyToken };


const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware to verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded token (could be {userId, isAdmin,...})
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

// New middleware: verify if Admin
const verifyAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access only. Unauthorized" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
