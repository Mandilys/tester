const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const db = require('./config/db');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const authMiddleware = require('./middleware/authMiddleware');

// Initialize Express app
const app = express();

db();
// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Set up session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolDB' }),
  cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set up view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// After setting up session middleware
app.use(flash());

// Make flash messages and user data available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.userId = req.session.userId;
  res.locals.userRole = req.session.userRole;
  res.locals.username = req.session.username;
  res.locals.currentPath = req.path;
  res.locals.title = 'Student Management System'; // Set a default title
  
  // For debugging: log flash messages and session data
  console.log('Request path:', req.path);
  console.log('Session data:', req.session);
  console.log('Flash messages:', {
    success: res.locals.success_msg,
    error: res.locals.error_msg
  });
  
  next();
});

// Add this route before other route definitions
app.get('/', authMiddleware.isAuthenticated, (req, res) => {
  res.render('home', { title: 'Home' });
});

// Import and use routes
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/payments', paymentRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404 - Not Found' });
});

// 500 Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: '500 - Server Error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
