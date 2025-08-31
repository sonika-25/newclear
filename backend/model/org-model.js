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

const Org = mongoose.model("Org", orgSchema);
module.exports = Org;
