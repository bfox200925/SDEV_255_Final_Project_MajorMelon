const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');  
const { ensureAuthenticated, ensureTeacher } = require('../middleware/authorization');

// Index Route - Show all courses (Accessible to everyone, including students)
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({});
        res.render('courses/index', { courses });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// GET route to display the new course form (Only for teachers)
router.get('/new', ensureTeacher, async (req, res) => {
    try {
        const teachers = await Teacher.find(); // Fetch all teachers to populate the dropdown
        res.render('courses/new', { teachers, errorMessage: null });
    } catch (err) {
        console.error(err);
        res.redirect('/courses');
    }
});

// POST route to create a new course (Only for teachers)
router.post('/', ensureTeacher, async (req, res) => {
    const { name, description, subject, credits, teacherId } = req.body; // Assuming teacherId is sent from the form

    try {
        const teacher = await Teacher.findById(teacherId); // Find the teacher by their ID
        if (!teacher) {
            throw new Error('Teacher not found');
        }

        const newCourse = new Course({
            name,
            description,
            subject,
            credits,
            teacher: teacher._id  // Assign the teacher's ObjectId to the course
        });

        await newCourse.save(); // Save the course to the database
        res.redirect('/courses');
    } catch (err) {
        console.error(err);
        res.render('courses/new', { errorMessage: 'Failed to create course. Please check your input.' });
    }
});

// Route to show individual course by ID (Accessible to everyone)
router.get('/:id', async (req, res) => {
    try {
        // Find the course by ID and populate the teacher information
        const course = await Course.findById(req.params.id).populate('teacher');
        if (!course) {
            return res.redirect('/courses'); // Redirect if course is not found
        }
        // Render the show view and pass the course data
        res.render('courses/show', { course });
    } catch (err) {
        console.error(err);
        res.redirect('/courses');  // Redirect on error
    }
});

// GET route to display the edit course form (Only for teachers)
router.get('/:id/edit', ensureTeacher, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        res.render('courses/edit', { course, errorMessage: null });
    } catch (err) {
        console.error(err);
        res.redirect('/courses');
    }
});

// PUT route to update an existing course (Only for teachers)
router.put('/:id', ensureTeacher, async (req, res) => {
    const { name, description, subject, credits, teacherId } = req.body;

    try {
        const teacher = await Teacher.findById(teacherId); // Find the teacher
        if (!teacher) {
            throw new Error('Teacher not found');
        }

        await Course.findByIdAndUpdate(req.params.id, {
            name,
            description,
            subject,
            credits,
            teacher: teacher._id  // Update the teacher assigned to the course
        });

        res.redirect(`/courses/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.render('courses/edit', { errorMessage: 'Failed to update course. Please check your input.' });
    }
});

// DELETE route - delete a specific course (Only for teachers)
router.delete('/:id', ensureTeacher, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.redirect('/courses');
    } catch (err) {
        console.error(err);
        res.redirect('/courses');
    }
});

// Search Route (Accessible to everyone)
router.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
        const courses = await Course.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { courseNumber: { $regex: query, $options: 'i' } }
            ]
        });
        res.render('courses/index', { courses });
    } catch (err) {
        console.error(err);
        res.redirect('/courses');
    }
});

module.exports = router;

