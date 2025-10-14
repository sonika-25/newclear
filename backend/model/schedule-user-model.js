const User = require("./user-model");
const Schedule = require("./schedule-model");
const mongoose = require("mongoose");

const scheduleUserSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
        required: true,
    },
    role: {
        type: String,
        enum: ["family", "POA", "carer", "serviceProvider", "manager"],
        required: true,
    },
});

const ScheduleUser = mongoose.model("ScheduleUser", scheduleUserSchema);
module.exports = ScheduleUser;
