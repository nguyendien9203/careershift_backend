const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
//const connectDB = require('./config/db');
require("dotenv").config();

// connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// define routes

module.exports = app;
