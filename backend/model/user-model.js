const mongoose = require("mongoose");
const Patient = require("./patient-model");
//need to change naming conventions (this will be user-schema )
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    role : {
        type: String,
        enum: ['family', 'POA'],
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
    patients: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Patient'
    }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
