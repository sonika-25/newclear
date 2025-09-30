const mongoose = require("mongoose");
require("dotenv").config();
URI = process.env.MONGO_URI;

const connectDB = async () => {
    if (!URI) {
        console.error("MongoDB URI is not defined");
        process.exit(1);
    }
    try {
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "test",
        });
        console.log("MongoDB Database Connected Successfully");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
