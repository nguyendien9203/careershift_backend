const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const interviewRoutes = require("./routes/interviewRoutes"); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Định nghĩa route
app.use("/api", interviewRoutes);

module.exports = app;
