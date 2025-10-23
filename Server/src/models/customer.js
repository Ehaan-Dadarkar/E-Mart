const db = require('../config/database');

const Customer = {
    async findAll() {
        const [rows] = await db.query('SELECT * FROM customers');
        return rows;
    },

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
        return rows[0];
    },

    async create(customerData) {
        const { name, email, phone } = customerData;
        const [result] = await db.query(
            'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone]
        );
        return { id: result.insertId, ...customerData };
    },

    async update(id, customerData) {
        const { name, email, phone } = customerData;
        const [result] = await db.query(
            'UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Customer;
