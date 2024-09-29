const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/admin/studentController');

// Student management page
router.get('/', studentController.getStudentManagement);

// Search for a student
router.get('/search', studentController.searchStudent);

// Render form to create a new student
router.get('/new', studentController.renderNewStudentForm);

// Create a new student
router.post('/', studentController.createStudent);

// Show details for a specific student
router.get('/:id', studentController.getStudentDetails);

// Render form to edit a student
router.get('/:id/edit', studentController.renderEditStudentForm);

// Update a specific student
router.patch('/:id', studentController.updateStudent);

// Delete a specific student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;