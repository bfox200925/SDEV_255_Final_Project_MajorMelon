const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    subjectArea: { 
        type: String, 
        required: true 
    },
    credits: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 10 
    },
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, // Ensure this is ObjectId
        ref: 'Teacher', // Reference to Teacher model
        required: true 
    }
});

module.exports = mongoose.model('Course', courseSchema);







