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
    currentOrg: {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'Org'
	},
    family: {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'User'
	},    
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
