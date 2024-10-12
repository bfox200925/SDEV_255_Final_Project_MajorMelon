const express = require('express');
const router = express.Router();
const Course = require('../models/Course');  // Import Course model

// Middleware to check if the user is logged in
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Middleware to check if the user is a teacher
function ensureTeacher(req, res, next) {
    if (req.user && req.user.role === 'teacher') {
        return next();
    }
    res.redirect('/');  // Redirect to home if not a teacher
}

// Middleware to check if the user is a student
function ensureStudent(req, res, next) {
    if (req.user && req.user.role === 'student') {
        return next();
    }
    res.redirect('/');  // Redirect to home if not a student
}

// Route for student dashboard
router.get('/student', ensureStudent, async (req, res) => {
    try {
        // Fetch all courses and populate the teacher's name
        const courses = await Course.find({}).populate('teacher', 'name');  // Assuming the 'teacher' field in Course model

        // Fetch the student's schedule courses and populate the teacher's name
        const scheduleCourses = await Course.find({ _id: { $in: req.user.courses } }).populate('teacher', 'name');

        // Render the student's dashboard with the available courses and schedule
        res.render('students-dashboard', { user: req.user, courses, scheduleCourses });
    } catch (err) {
        console.error(err);
        res.redirect('/');  // Redirect on error
    }
});

// POST route to add a course to the student's schedule
router.post('/add-course/:courseId', ensureStudent, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const user = req.user;

        if (!user.courses.includes(courseId)) {
            user.courses.push(courseId);
            await user.save();
        }
        res.redirect('/dashboard/student');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/student');
    }
});

// Remove course from student's schedule
router.post('/remove-course/:courseId', ensureStudent, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const user = req.user;

        // Remove course ID from student's courses array
        user.courses = user.courses.filter(course => course.toString() !== courseId);
        await user.save();  // Save the updated student information

        res.redirect('/dashboard/student');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard/student');
    }
});

// Teacher dashboard - display all courses with teacher information
router.get('/teacher', ensureTeacher, async (req, res) => {
    try {
        // Fetch all courses and populate teacher's name
        const courses = await Course.find().populate('teacher', 'name');
        res.render('teacher-dashboard', { user: req.user, courses });
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.redirect('/dashboard/teacher');
    }
});


// GET route for rendering the new course form
router.get('/add-course', ensureTeacher, async (req, res) => {
    try {
        const teachers = await Teacher.find(); // Fetch all teachers
        res.render('new', { teachers });  // Render the form with teachers list
    } catch (err) {
        console.error('Error fetching teachers:', err);
        res.redirect('/dashboard/teacher');
    }
});

// POST route to handle adding a new course
router.post('/add-course', ensureTeacher, async (req, res) => {
    try {
        const { name, description, subjectArea, credits, teacher } = req.body;

        // Create a new course document
        const newCourse = new Course({
            name,
            description,
            subjectArea,
            credits,
            teacher  // This is the instructor's ID
        });

        // Save the new course to the database
        await newCourse.save();

        // Redirect back to the teacher dashboard after saving
        res.redirect('/dashboard/teacher');
    } catch (err) {
        console.error('Error adding course:', err);
        res.redirect('/dashboard/teacher');  // Redirect on error
    }
});


// GET route to fetch and render the edit course page
router.get('/edit-course/:id', ensureTeacher, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id); // Find course by ID
        if (!course) {
            return res.redirect('/dashboard/teacher'); // If course not found, redirect back
        }
        res.render('courses/edit', { course }); // Render the edit form with course data
    } catch (err) {
        console.error('Error fetching course:', err);
        res.redirect('/dashboard/teacher');
    }
});

// POST route to handle the course update
router.post('/edit-course/:id', ensureTeacher, async (req, res) => {
    try {
        const { name, description, credits, subjectArea } = req.body; // Destructure form data
        await Course.findByIdAndUpdate(req.params.id, {
            name,
            description,
            credits,
            subjectArea
        });
        res.redirect('/dashboard/teacher'); // Redirect back to the teacher dashboard after update
    } catch (err) {
        console.error('Error updating course:', err);
        res.redirect('/dashboard/teacher');
    }
});


// Delete course
router.post('/delete-course/:id', ensureTeacher, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.redirect('/dashboard/teacher');
    } catch (err) {
        console.error('Error deleting course:', err);
        res.redirect('/dashboard/teacher');
    }
});

module.exports = router;
