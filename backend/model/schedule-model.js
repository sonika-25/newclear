const mongoose = require("mongoose");
const scheduleSchema = new mongoose.Schema({
    scheduleAuthor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    resident_name : {
        type: String,
        required: true,
    },
    schedule_id: {
        type: String,
        required: true,
        unique: true,
    },
    schedule_password: {
        type: String,
        required: true,
    },
    tasks: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Task'
    }],
    schedule_users: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],
    inviteToken: {
        type: String,
        unique: true,
        required: true
    }
});