const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const app = express();

// Import login, register, and logout routes
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const logoutRoutes = require('./routes/logout');

// Database connection
mongoose.connect('mongodb://localhost:27017/SchoolDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware configuration
app.use(session({
    secret: 'majormelons',  
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Method Override for PUT/DELETE requests
app.use(methodOverride('_method'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Passport configuration for login strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return done(null, false, { message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Serialize and deserialize user for session handling
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);  // Use async/await
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Make user information available in all views
app.use((req, res, next) => {
    res.locals.user = req.user;  // If user is logged in, req.user will be populated
    next();
});

// Routes 
app.get('/', (req, res) => {
    res.render('home', { title: 'Homepage' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

// Import course route
const courseRoutes = require('./routes/courses');
app.use('/courses', courseRoutes);

// Import dashboard route
const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);

// Use the login, register, and logout routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/logout', logoutRoutes);

// Logout route
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);  // Handle any errors
        }
        res.redirect('/');  // Redirect to the homepage after logout
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong! Please try again later.');
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

