// controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');

// Render login page
exports.renderLoginPage = (req, res) => {
  res.render('login', { title: 'Login' });
};

// Handle login form submission
exports.handleLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      req.flash('error_msg', 'Invalid username or password.');
      return res.redirect('/login');
    }

    console.log('Stored hashed password:', user.password, typeof user.password);
    console.log('Provided password:', password, password.length);

    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log('Password match result:', isMatch);

    if (isMatch) {
      // Set session variables
      req.session.userId = user._id;
      req.session.userRole = user.role;
      req.session.username = user.username;

      req.flash('success_msg', 'You have successfully logged in.');
      console.log('Flash message set:', req.flash('success_msg'));
      
      // Redirect based on role
      if (user.role === 'admin') {
        console.log('Redirecting to /admin/students');
        return res.redirect('/admin/students');
      } else if (user.role === 'employee') {
        console.log('Redirecting to /payments');
        return res.redirect('/payments');
      } else {
        console.log('Redirecting to /');
        return res.redirect('/');
      }
    } else {
      req.flash('error_msg', 'Invalid username or password.');
      console.log('Flash message set:', req.flash('error_msg'));
      return res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred during login.');
    console.log('Flash message set:', req.flash('error_msg'));
    return res.redirect('/login');
  }
};

// Handle logout
exports.handleLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
};

// Render change password form
exports.renderChangePasswordForm = (req, res) => {
  res.render('admin/change-password', { title: 'Change Password' });
};

// Change admin password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/admin/change-password');
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (isMatch) {
      user.password = newPassword;
      await user.save();

      req.flash('success_msg', 'Password changed successfully.');
      console.log('Flash message set:', req.flash('success_msg'));
      return res.redirect('/admin/students');
    } else {
      req.flash('error_msg', 'Current password is incorrect.');
      console.log('Flash message set:', req.flash('error_msg'));
      return res.redirect('/admin/change-password');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'An error occurred while changing the password.');
    console.log('Flash message set:', req.flash('error_msg'));
    return res.redirect('/admin/change-password');
  }
};
