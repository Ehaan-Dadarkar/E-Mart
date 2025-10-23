const db = require('../config/database');

const Product = {
    async findAll() {
        const [rows] = await db.query('SELECT * FROM products');
        return rows;
    },

    async findById(id) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    },

    async create(productData) {
        const { name, price, category, inStock } = productData;
        const [result] = await db.query(
            'INSERT INTO products (name, price, category, inStock) VALUES (?, ?, ?, ?)',
            [name, price, category, inStock]
        );
        return { id: result.insertId, ...productData };
    },

    async update(id, productData) {
        const { name, price, category, inStock } = productData;
        const [result] = await db.query(
            'UPDATE products SET name = ?, price = ?, category = ?, inStock = ? WHERE id = ?',
            [name, price, category, inStock, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Product;
