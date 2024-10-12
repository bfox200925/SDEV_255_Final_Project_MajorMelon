const mongoose = require('mongoose');
const Teacher = require('./models/Teacher'); // Adjust path to Teacher model

mongoose.connect('mongodb://localhost:27017/SchoolDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

async function createTeachers() {
    const teachers = [
        {
            name: "Prof. Mark Smith",
            username: "marksmith",
            password: "password123"
        },
        {
            name: "Prof. Jane Smith",
            username: "janesmith",
            password: "password123"
        },
        {
            name: "Dr. Emily Brown",
            username: "emilybrown",
            password: "password123"
        },
        {
            name: "Prof. Sam Brown",
            username: "sambrown",
            password: "password123"
        },
        {
            name: "Prof. Joe Morris",
            username: "joemorris",
            password: "password123"
        },
        
        // Add more teachers as needed
    ];

    try {
        await Teacher.insertMany(teachers);
        console.log('Teachers created successfully!');
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

createTeachers();

