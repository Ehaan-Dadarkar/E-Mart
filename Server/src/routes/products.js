const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { validateProduct } = require("../middleware/validation");

// GET all products
router.get("/", async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");
    res.json(products || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const [product] = await db.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product[0]);
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// POST new product
router.post("/", validateProduct, async (req, res) => {
  try {
    const { name, price, category, inStock, imageUrl } = req.body;
    const [result] = await db.query(
      "INSERT INTO products (name, price, category, inStock, imageUrl) VALUES (?, ?, ?, ?, ?)",
      [name, price, category, inStock, imageUrl || null]
    );
    const [newProduct] = await db.query("SELECT * FROM products WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PUT update product
router.put("/:id", validateProduct, async (req, res) => {
  try {
    const { name, price, category, inStock, imageUrl } = req.body;
    const [result] = await db.query(
      "UPDATE products SET name = ?, price = ?, category = ?, inStock = ?, imageUrl = ? WHERE id = ?",
      [name, price, category, inStock, imageUrl || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [updatedProduct] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );
    res.json(updatedProduct[0]);
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
