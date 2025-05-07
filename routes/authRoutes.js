const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUserInfo,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Get user info (protected route)
router.get("/me", authenticateToken, getUserInfo);

module.exports = router;
