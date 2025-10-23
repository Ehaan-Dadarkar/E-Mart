const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateCustomer } = require('../middleware/validation');

// GET all customers
router.get('/', async (req, res) => {
    try {
        const [customers] = await db.query('SELECT * FROM customers');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single customer
router.get('/:id', async (req, res) => {
    try {
        const [customer] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if (customer.length > 0) {
            res.json(customer[0]);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new customer
router.post('/', validateCustomer, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const [result] = await db.query(
            'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone]
        );
        const [newCustomer] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
        res.status(201).json(newCustomer[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update customer
router.put('/:id', validateCustomer, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const [result] = await db.query(
            'UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, req.params.id]
        );
        if (result.affectedRows > 0) {
            const [updatedCustomer] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
            res.json(updatedCustomer[0]);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;