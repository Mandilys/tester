const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Update this route at the beginning of the file
router.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

// Import admin route modules
const studentRoutes = require('./admin/studentRoutes');
const employeeRoutes = require('./admin/employeeRoutes');
const transportFeesRoutes = require('./admin/transportFeesRoutes');
const educationFeesRoutes = require('./admin/educationFeesRoutes');
const reportRoutes = require('./admin/reportRoutes');
const authController = require('../controllers/authController');
const reportController = require('../controllers/admin/reportController');

// Ensure the user is authenticated and is an admin
router.use(authMiddleware.isAuthenticated);
router.use(authMiddleware.isAdmin);

// Use admin route modules
router.use('/students', studentRoutes);
router.use('/employees', employeeRoutes);
router.use('/transportFees', transportFeesRoutes);
router.use('/educationFees', educationFeesRoutes);
router.use('/reports', reportRoutes);

// Add route for changing admin password
router.get('/change-password', authController.renderChangePasswordForm);
router.post('/change-password', authController.changePassword);

// Add route for monthly report
router.get('/reports', reportController.getMonthlyReport);

module.exports = router;