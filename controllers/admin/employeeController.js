const User = require('../../models/User');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).sort({ username: 1 });
    res.render('admin/employees/index', { employees });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getEmployeeDetails = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).send('Employee not found.');
    res.render('admin/employees/show', { employee });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving employee details.');
  }
};

exports.renderNewEmployeeForm = (req, res) => {
  res.render('admin/employees/new');
};

exports.createEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;
    const newEmployee = new User({
      username,
      password: password,
      role: 'employee'
    });
    await newEmployee.save();
    res.redirect('/admin/employees');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating employee.');
  }
};

exports.renderEditEmployeeForm = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).send('Employee not found.');
    res.render('admin/employees/edit', { employee });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving employee.');
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).send('Employee not found.');

    employee.username = username;
    if (password) {
      employee.password = password;
    }
    await employee.save();
    res.redirect('/admin/employees');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating employee.');
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/employees');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting employee.');
  }
};