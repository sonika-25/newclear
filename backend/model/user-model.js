const mongoose = require("mongoose");
const Patient = require("./patient-model");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ["family", "POA", "organisation", "carer"],
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
            type: String,
            required: false,
        },
    ],
});

const Family = mongoose.model("User", userSchema);
module.exports = Family;
