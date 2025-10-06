const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
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
		type : mongoose.Schema.Types.ObjectId,
		ref : 'Patient'
	}],
    
});

const Org = mongoose.model("Org", orgSchema);
module.exports = Org;
