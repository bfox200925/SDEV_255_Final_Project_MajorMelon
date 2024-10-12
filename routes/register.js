const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');  // To hash passwords

// Show signup form based on the role (student or teacher)
router.get('/', (req, res) => {
    const role = req.query.role || 'student';  // Default to student if no role is provided
    res.render('register', { title: 'Signup', role });
});

// Handle the signup form submission
router.post('/', async (req, res, next) => {
    try {
        const { username, password, department, studentID } = req.body;
        const role = req.query.role || 'student';  // Default role to 'student'

        // Log the data received from the form and role
        console.log('Received form data:', req.body);
        console.log('Role received from query:', role);

        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.error('Username already exists:', username);
            return res.status(400).send('Username already taken. Please choose another.');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user object
        const newUser = new User({ username, password: hashedPassword, role });

        // Validate and assign additional data for teachers and students
        if (role === 'teacher') {
            if (!department) {
                console.error('Department is required for teachers');
                return res.status(400).send('Department is required for teachers.');  // Redirect back if department is missing
            }
            newUser.department = department;  // Add department for teachers
            console.log('Saving as teacher with department:', department);
        } else if (role === 'student') {
            if (!studentID) {
                console.error('Student ID is required for students');
                return res.status(400).send('Student ID is required for students.');  // Redirect back if studentID is missing
            }
            newUser.studentID = studentID;  // Add student-specific data
            console.log('Saving as student with studentID:', studentID);
        }

        // Save the user to the database
        await newUser.save();

        // Auto login the user after registration
        req.login(newUser, (err) => {
            if (err) return next(err);

            // Redirect based on user role
            if (newUser.role === 'teacher') {
                return res.redirect('/dashboard/teacher');  // Redirect teachers to their dashboard
            }
            return res.redirect('/dashboard/student');  // Redirect students to their dashboard
        });
    } catch (err) {
        console.error('Error creating user:', err);
        return res.status(500).send('An error occurred during registration. Please try again later.');
    }
});

module.exports = router;










