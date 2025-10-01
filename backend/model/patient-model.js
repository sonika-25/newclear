const mongoose = require("mongoose");
//FOR PATIENT (need to change all names etc from User to Patient)
const patientSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
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
    tasks: [{
		type : mongoose.Schema.Types.ObjectId,
		ref : 'Task'
	}],
    currentOrgId: {
		type : String,
		required : false,
	},
    categories : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    familyId: {
		type : String,
		required : false,
	},    
    budget : {
        type: Number,
        required: false,
    }
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
