const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    value:{
        type:Number,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    ],
    scheduleId: {
        type: String,
        required: true,
    },
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
