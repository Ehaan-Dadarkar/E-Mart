const morgan = require('morgan');

// Custom morgan format
const logFormat = ':method :url :status :response-time ms - :res[content-length]';

// Create custom logging middleware
const logger = morgan(logFormat, {
    skip: (req, res) => process.env.NODE_ENV === 'test'
});

module.exports = logger;
