const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const offerRouter = require("./routers/offerRouter");

//const connectDB = require('./config/db');
require("dotenv").config();

// connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));


// define routes
app.use('/api/offer', offerRouter);

module.exports = app;
