const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose
            .connect(MONGO_URI)
            .then(() => console.log("Mongo connected"));
    } catch (error) {
        console.log("MongoDB connection error: ", error);
        process.exit(1);
    }
}

module.exports = connectDB;