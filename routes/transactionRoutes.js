const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
} = require("../controllers/transactionController");
const { authenticateToken } = require("../middleware/authMiddleware");

// All transaction routes are protected
router.get("/", authenticateToken, getAllTransactions);
router.get("/:id", authenticateToken, getTransactionById);
router.post("/", authenticateToken, createTransaction);
router.put("/:id", authenticateToken, updateTransactionStatus);

module.exports = router;
