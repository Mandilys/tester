const express = require('express');
const router = express.Router();
const educationFeesController = require('../../controllers/admin/educationFeesController');

router.get('/', educationFeesController.redirectToCurrentYearEducationFees);

// Display education fees for a specific year
router.get('/:year', educationFeesController.getEducationFeesByYear);

// Render form to edit education fees for a specific year
router.get('/:year/edit', educationFeesController.renderEditEducationFeesForm);

// Update education fees for a specific year
router.post('/:year', educationFeesController.updateEducationFeesByYear);

module.exports = router;