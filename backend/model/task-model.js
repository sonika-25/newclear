const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
    },
    descriptiom: {
        type: String,
        required: true,
    },
    frequency: {
        type: Number,
         enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
        required: true,
    },
    interval : {
        type: Number,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    isCompleted : {
        type: Boolean,
        required: true,
    },
    assignedTo : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
