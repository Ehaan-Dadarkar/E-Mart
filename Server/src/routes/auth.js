const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database'); // Correct path to database.js

// ----------------------
// REGISTER
// ----------------------
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const [existing] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into customers table
        const [result] = await db.query(
            'INSERT INTO customers (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
            [name, email, phone, hashedPassword]
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId,
            name
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ----------------------
// LOGIN
// ----------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const [users] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            userId: user.id,
            name: user.name
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
