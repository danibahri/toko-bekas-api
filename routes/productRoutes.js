const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protected routes
router.get("/", authenticateToken, getAllProducts);
router.get("/:id", authenticateToken, getProductById);
router.post("/", authenticateToken, createProduct);
router.put("/:id", authenticateToken, updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

module.exports = router;
