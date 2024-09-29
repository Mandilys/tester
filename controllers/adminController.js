const studentController = require('./admin/studentController');
const employeeController = require('./admin/employeeController');
const transportFeesController = require('./admin/transportFeesController');
const educationFeesController = require('./admin/educationFeesController');
const reportController = require('./admin/reportController');

module.exports = {
  ...studentController,
  ...employeeController,
  ...transportFeesController,
  ...educationFeesController,
  ...reportController
};