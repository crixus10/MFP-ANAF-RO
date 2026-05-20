const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const i18n = require('i18n');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// i18n configuration
i18n.configure({
  locales: ['ro', 'en'],
  defaultLocale: 'ro',
  directory: path.join(__dirname, 'locales'),
  autoWatch: true,
  updateFiles: false,
  cookie: 'language'
});

app.use(i18n.init);

// Database initialization
const { sequelize } = require('./config/database');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/anaf', require('./routes/anaf'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection error:', err);
});

module.exports = app;
