const mongoose = require("mongoose");
const Patient = require("./patient-model");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    patients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
        },
    ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
