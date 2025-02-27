const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
//const connectDB = require('./config/db');
require("dotenv").config();

// connectDB();

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

// define routes

module.exports = app;
