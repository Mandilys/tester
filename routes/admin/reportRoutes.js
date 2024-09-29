const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/admin/reportController');

// Display monthly payment report
router.get('/monthly', reportController.getMonthlyReport);

module.exports = router;