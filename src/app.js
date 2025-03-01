const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require('./config/db');
require("dotenv").config();
const Candidate = require("./models/Candidate");
const User = require("./models/User");
const CandidateComparison = require("./models/CandidateComparison");
const Job = require("./models/Job");
const Interview = require("./models/Interview");
const Recruitment = require("./models/Recruitment");
const Offer = require("./models/Offer");
const Permission = require("./models/Permission");
const Role = require("./models/Role");
const Token = require("./models/Token");
const emailRouters = require("./routers/emailRouters");
// connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// define routes
app.use("/api",emailRouters)
module.exports = app;
