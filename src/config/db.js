<<<<<<< HEAD
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careershift');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
=======
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
>>>>>>> develop
    process.exit(1);
  }
};

module.exports = connectDB;
