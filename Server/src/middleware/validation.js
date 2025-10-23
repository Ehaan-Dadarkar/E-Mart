// Validate customer request middleware
const validateCustomer = (req, res, next) => {
    const { name, email, phone } = req.body;
    const errors = [];

    if (!name) errors.push('Name is required');
    if (!email) errors.push('Email is required');
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push('Invalid email format');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

// Validate product request middleware
const validateProduct = (req, res, next) => {
    const { name, price, category } = req.body;
    const errors = [];

    if (!name) errors.push('Name is required');
    if (!price) errors.push('Price is required');
    if (price && isNaN(price)) errors.push('Price must be a number');
    if (!category) errors.push('Category is required');

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

module.exports = {
    validateCustomer,
    validateProduct
};
