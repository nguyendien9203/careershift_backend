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
const candidateRouter = require("./routers/candidateRouters");
const interviewRouter = require("./routers/interviewRouter");
const offerRouter = require("./routers/offerRouter");
const permissionRouter = require("./routers/permissionRouter");
const roleRouter = require("./routers/roleRouter");
const userRouter = require("./routers/userRouter");
// connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// define routes
app.use("/api",emailRouters)
app.use('/api/candidate', candidateRouter);
app.use('/api/interview', interviewRouter);
app.use('/api/offer', offerRouter);
app.use('/api/permission',permissionRouter);
app.use('/api/role',roleRouter);
app.use('/api/user',userRouter);

// app.use((err, req, res) => {
//     if(err){
//         res.status(err.status || 500).json({
//             status: err.status,
//             message: err.message
//         })
        
//     }
// })
module.exports = app;
