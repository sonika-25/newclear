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
    tasks: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Task' 
    }]
    
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
