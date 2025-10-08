const mongoose = require("mongoose");
const scheduleSchema = new mongoose.Schema({
    scheduleOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    pwsnName: {
        type: String,
        required: true,
    },
    inviteToken: {
        type: String,
        unique: true,
        required: true,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
    ],
    budget: {
        type: Number,
        required: false,
    },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
