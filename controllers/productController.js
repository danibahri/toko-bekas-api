const pool = require("../config/database");

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.*, u.username as seller_name 
      FROM products p
      JOIN users u ON p.user_id = u.id
    `);

    res.status(200).json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const [products] = await pool.query(
      `
      SELECT p.*, u.username as seller_name 
      FROM products p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product: products[0] });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, condition } = req.body;
    const userId = req.user.id;

    // Validate request
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, `condition`, user_id) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, condition, userId]
    );

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, condition } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    // Check if product exists and belongs to user
    const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (products[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own products" });
    }

    // Update product
    await pool.query(
      "UPDATE products SET name = ?, description = ?, price = ?, condition = ? WHERE id = ?",
      [name, description, price, condition, productId]
    );

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // Check if product exists and belongs to user
    const [products] = await pool.query("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (products[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own products" });
    }

    // Check if there are any transactions for this product
    const [transactions] = await pool.query(
      "SELECT * FROM transactions WHERE product_id = ?",
      [productId]
    );

    if (transactions.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete product with existing transactions" });
    }

    // Delete product
    await pool.query("DELETE FROM products WHERE id = ?", [productId]);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
