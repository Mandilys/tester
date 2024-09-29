const express = require('express');
const router = express.Router();
const transportFeesController = require('../../controllers/admin/transportFeesController');

router.get('/', transportFeesController.redirectToCurrentYearTransportFees);
router.get('/:year', transportFeesController.listDistrictsByYear);
router.post('/:year/new', transportFeesController.createTransportFeesForNewDistrict);
router.get('/:year/:district', transportFeesController.getTransportFeesByYearAndDistrict);
router.get('/:year/:district/edit', transportFeesController.renderEditTransportFeesForm);
router.post('/:year/:district', transportFeesController.updateTransportFeesByYearAndDistrict);
router.post('/:year/:district/delete', transportFeesController.deleteTransportFees);

module.exports = router;