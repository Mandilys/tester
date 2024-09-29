// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Render login page
// GET /login
router.get('/login', authController.renderLoginPage);

// Handle login form submission
// POST /login
router.post('/login', (req, res, next) => {
  console.log('Login attempt:', req.body);
  authController.handleLogin(req, res, next);
});

// Handle logout
// GET /logout
router.get('/logout', authController.handleLogout);


module.exports = router;