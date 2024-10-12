const express = require('express');
const passport = require('passport');
const router = express.Router();

// Show login form based on role
router.get('/', (req, res) => {
    const role = req.query.role || 'student';  // Default to student if no role is provided
    res.render('login', { title: 'Login', role });
});

// Handle login
router.post('/', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            // If no user found or password incorrect, redirect back to login with role info
            return res.redirect('/login?role=' + req.body.role);
        }

        // Login the user if authentication is successful
        req.logIn(user, (err) => {
            if (err) return next(err);

            // Check the user's role and redirect accordingly
            if (user.role === 'teacher') {
                return res.redirect('/dashboard/teacher');
            } else if (user.role === 'student') {
                return res.redirect('/dashboard/student');
            } else {
                return res.redirect('/');  // Fallback to home if no role is found
            }
        });
    })(req, res, next);
});

module.exports = router;


