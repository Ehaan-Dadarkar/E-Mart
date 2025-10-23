const db = require("../config/database");

const Customer = {
  // Get all customers
  async findAll() {
    const [rows] = await db.query("SELECT * FROM customers");
    return rows;
  },

  // Get single customer by ID
  async findById(id) {
    const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);
    return rows[0] || null;
  },

  // Create new customer
  async create({ name, email, phone }) {
    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );
    return { id: result.insertId, name, email, phone };
  },

  // Update customer by ID
  async update(id, { name, email, phone }) {
    const [result] = await db.query(
      "UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, id]
    );
    return result.affectedRows > 0;
  },

  // Delete customer by ID
  async delete(id) {
    const [result] = await db.query("DELETE FROM customers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Customer;
