// placeholder schedule
const mongoose = require("mongoose");
const scheduleSchema = new mongoose.Schema({
    scheduleAuthor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    residentName: {
        type: String,
        required: true,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
    inviteToken: {
        type: String,
        unique: true,
        required: true,
    },
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;
