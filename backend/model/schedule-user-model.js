const User = require("./user-model");
const Schedule = require("./schedule-model");

const scheduleUserSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
        required: true,
    },
    role: {
        type: String,
        enum: ["family", "POA", "carer", "organisation"],
        required: true,
    },
});

const ScheduleUser = mongoose.model("ScheduleUser", scheduleUserSchema);
