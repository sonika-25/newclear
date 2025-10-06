const mongoose = require("mongoose");
const Patient = require("./patient-model");
//need to change naming conventions (this will be user-schema )
const familySchema = new mongoose.Schema({
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
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    patients: [{
        type : String,
		required : false,
    }],
});

const Family = mongoose.model("Family", familySchema);
module.exports = Family;
