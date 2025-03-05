const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
//const connectDB = require('./config/db');
require("dotenv").config();
const mongoose = require("mongoose");
// const User = require("./models /User");
// const Job = require("./models /Job");
// const Candidate = require("./models /Candidate");
// const CandidateComparison = require("./models /CandidateComparison");
// const Recruitment = require("./models /Recruitment");
// const Offer = require("./models /Offer");
// const Interview = require("./models /Interview");
// const Permission = require("./models /Permission");
// const Role = require("./models /Role");
// // const Recruitment = require("./models /Recruitment");
// const Token = require("./models /Token");
// const emailRouters = require("./routers/emailRouters");
const candidateRouters = require("./routers/candidateRouters");

// connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// define routes
app.use("/api", candidateRouters);

module.exports = app;
