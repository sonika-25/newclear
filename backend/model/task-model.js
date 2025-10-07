const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        frequency: {
            type: String,
            enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
            required: false,
        },
        unit: {
            type: String,
            enum: ["day", "week", "month", "year"],
            required: true,
        },
        every: { type: Number, min: 1, default: 1 },
        budget: { type: Number, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },

        isCompleted: { type: Boolean, required: false },
        assignedToCarer: { type: String, required: false },
        active: { type: Boolean, default: true },
    },
    { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
