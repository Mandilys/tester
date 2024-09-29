// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// Ensure the user is authenticated
router.use(authMiddleware.isAuthenticated);

//
// Education Payment Routes
//

// Refactored Route: Display payment page for a student and year using query parameters
// GET /payments/education?studentId=XYZ&year=2023
router.get('/education', paymentController.getEducationPayments);

// Existing Route: Update individual payment
// POST /payments/education/update/:paymentId
// No changes needed as paymentId remains a URL parameter
router.post('/education/update/:paymentId', paymentController.updateIndividualPayment);

// Existing Route: View payment status history
// GET /payments/education/:studentId/:year/status/:paymentId/history
// Refactor to use query parameters for studentId and year
router.get('/education/status/history', paymentController.getPaymentStatusHistory);

//
// Transport Payment Routes
//

// Refactored Route: Display payment page for transport using query parameters
// GET /payments/transport?studentId=XYZ&year=2023
router.get('/transport', paymentController.getTransportPayments);

// Existing Route: Update individual transport payment
// POST /payments/transport/update/:paymentId
router.post('/transport/update/:paymentId', paymentController.updateIndividualPayment);

// Refactor to use query parameters for transport payment status history
router.get('/transport/status/history', paymentController.getPaymentStatusHistory);

module.exports = router;