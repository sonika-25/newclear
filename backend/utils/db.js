const mongoose = require("mongoose");

const URI = process.env.MONGO_URI;

const connectDB = async () => {
    if (!URI) {
        console.error("MongoDB URI is not defined");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(URI, {
            dbName: "users",
        });
        console.log("MongoDB Database Connected Successfully");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
