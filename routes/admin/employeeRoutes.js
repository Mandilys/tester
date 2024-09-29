const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/admin/employeeController');

// List all employees
router.get('/', employeeController.getAllEmployees);

// Render form to create a new employee
router.get('/new', employeeController.renderNewEmployeeForm);

// Create a new employee
router.post('/', employeeController.createEmployee);

// Show details for a specific employee
router.get('/:id', employeeController.getEmployeeDetails);

// Render form to edit an employee
router.get('/:id/edit', employeeController.renderEditEmployeeForm);

// Update a specific employee
router.patch('/:id', employeeController.updateEmployee);

// Delete a specific employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;