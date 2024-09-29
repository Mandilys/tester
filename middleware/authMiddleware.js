// middleware/authMiddleware.js

exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        req.flash('error_msg', 'Please log in to view this resource.');
        res.redirect('/login');
    }
};
  
exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.userRole === 'admin') {
        return next();
    } else {
        res.status(403).send('Forbidden: Admins only');
    }
};
