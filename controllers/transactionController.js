const pool = require("../config/database");

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get transactions where user is buyer or seller
    const [transactions] = await pool.query(
      `
      SELECT t.*, 
             p.name as product_name, 
             buyer.username as buyer_name, 
             seller.username as seller_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users buyer ON t.buyer_id = buyer.id
      JOIN users seller ON t.seller_id = seller.id
      WHERE t.buyer_id = ? OR t.seller_id = ?
    `,
      [userId, userId]
    );

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user.id;

    const [transactions] = await pool.query(
      `
      SELECT t.*, 
             p.name as product_name, 
             buyer.username as buyer_name, 
             seller.username as seller_name
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      JOIN users buyer ON t.buyer_id = buyer.id
      JOIN users seller ON t.seller_id = seller.id
      WHERE t.id = ? AND (t.buyer_id = ? OR t.seller_id = ?)
    `,
      [transactionId, userId, userId]
    );

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "Transaction not found or access denied" });
    }

    res.status(200).json({ transaction: transactions[0] });
  } catch (error) {
    console.error("Get transaction by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create transaction
const createTransaction = async (req, res) => {
  try {
    const { product_id } = req.body;
    const buyer_id = req.user.id;

    // Validate request
    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Get product information
    const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [
      product_id,
    ]);

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = products[0];

    // Prevent buying own product
    if (product.user_id === buyer_id) {
      return res
        .status(400)
        .json({ message: "You cannot buy your own product" });
    }

    // Create transaction
    const [result] = await pool.query(
      "INSERT INTO transactions (product_id, buyer_id, seller_id, price, status) VALUES (?, ?, ?, ?, ?)",
      [product_id, buyer_id, product.user_id, product.price, "pending"]
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transactionId: result.insertId,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transactionId = req.params.id;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ["pending", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Check if transaction exists and user is seller
    const [transactions] = await pool.query(
      "SELECT * FROM transactions WHERE id = ?",
      [transactionId]
    );

    if (transactions.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Only seller can update transaction status
    if (transactions[0].seller_id !== userId) {
      return res
        .status(403)
        .json({ message: "Only the seller can update transaction status" });
    }

    // Update transaction
    await pool.query("UPDATE transactions SET status = ? WHERE id = ?", [
      status,
      transactionId,
    ]);

    res
      .status(200)
      .json({ message: "Transaction status updated successfully" });
  } catch (error) {
    console.error("Update transaction status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
};
