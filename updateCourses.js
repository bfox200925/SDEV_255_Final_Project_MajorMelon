const mongoose = require('mongoose');
const Course = require('./models/Course');  // Adjusted path
const Teacher = require('./models/Teacher');  // Adjusted path

mongoose.connect('mongodb://localhost:27017/SchoolDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

async function updateCourses() {
    try {
        // Find teachers by username
        const markSmith = await Teacher.findOne({ username: 'marksmith' });
        const janeSmith = await Teacher.findOne({ username: 'janesmith' });
        const emilyBrown = await Teacher.findOne({ username: 'emilybrown' });
        const samBrown = await Teacher.findOne({ username: 'sambrown' });
        const joeMorris = await Teacher.findOne({ username: 'joemorris' });

        if (markSmith && janeSmith && emilyBrown && samBrown && joeMorris) {
            // Step 1: Update courses that have the teacher name as a string
            await Course.updateMany({ teacher: "Prof. Mark Smith" }, { $set: { teacher: markSmith._id } });
            await Course.updateMany({ teacher: "Prof. Jane Smith" }, { $set: { teacher: janeSmith._id } });
            await Course.updateMany({ teacher: "Dr. Emily Brown" }, { $set: { teacher: emilyBrown._id } });
            await Course.updateMany({ teacher: "Prof. Sam Brown" }, { $set: { teacher: samBrown._id } });
            await Course.updateMany({ teacher: "Prof. Joe Morris" }, { $set: { teacher: joeMorris._id } });

            console.log('Courses updated successfully!');
        } else {
            console.log('Some teachers were not found in the Teacher collection!');
        }
    } catch (err) {
        console.error('Error during update:', err);
    } finally {
        mongoose.connection.close();
    }
}

updateCourses();



