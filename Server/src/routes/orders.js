const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.post("/", async (req, res) => {
  try {
    const { userId, name, address, city, state, zip, total, items } = req.body;

    // Validate required fields
    if (
      !userId ||
      !name ||
      !address ||
      !city ||
      !state ||
      !zip ||
      !total ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields or empty cart" });
    }

    const totalNumber = parseFloat(total);
    const itemsJSON = JSON.stringify(items);

    const [result] = await pool.query(
      "INSERT INTO orders (customer_name, customer_address, customer_city, customer_state, customer_zip, total, items, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, address, city, state, zip, totalNumber, itemsJSON, userId]
    );

    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM orders WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

// PUT update order
router.put("/:id", async (req, res) => {
  try {
    const {
      customer_name,
      customer_address,
      customer_city,
      customer_state,
      customer_zip,
      total,
    } = req.body;
    const [result] = await pool.query(
      "UPDATE orders SET customer_name=?, customer_address=?, customer_city=?, customer_state=?, customer_zip=?, total=? WHERE id=?",
      [
        customer_name,
        customer_address,
        customer_city,
        customer_state,
        customer_zip,
        total,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

module.exports = router;
