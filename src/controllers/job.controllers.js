const { format } = require("morgan");
const Job = require("../models/job.model");
const User = require("../models/user.model");

// Create job
exports.createJob = async (req, res, next) => {
    try {
        const {title, platform, source_url, created_by, updated_by} = req.body;
        // We need to get the user id by decode the token, this will be done in the middleware
        // Should I validate userId ?
        // let token = req.headers.authorization;

        created_by = req.user._id;
        updated_by = req.user._id;

        const newJob = new Job({
            title,
            source_url,
            created_by,
            updated_by
        });
        await newJob.save().then(newJob => {
            res.status(201).json({
                message: "Job created successfully",
                data: newJob
            })
        })
    } catch (error) {
        next(error);
    }
}

// Get all jobs
exports.getJobs = async (req, res, next) => {
    try {
        // By default mongoose queries return an instance of Mongoose document class
        // Convert mongoose object to json for modify + lighter than mongoose document
        // https://mongoosejs.com/docs/tutorials/lean.html
        const jobs = await Job.find().populate("created_by", "name" ).populate("updated_by", "name").lean();

        const formattedJobs = jobs.map(job => ({
            ...job,
            created_by: job.created_by.name,
            updated_by: job.updated_by.name
        }))
        if (formattedJobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found"
            })
        }
        res.status(200).json({
            message: "Jobs fetched successfully",
            data: formattedJobs
        })
    } catch (error) {
        next(error);
    }
}

// Get job by JobID
exports.getJobById = async (req, res, next) => {
    try {
        const job = await job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }
        res.status(200).json({
            message: "Job fetched successfully",
            data: job
        })
    } catch (error) {
        next(error);
    }
}

// Get job by UserID
exports.getJobsByUserId = async (req, res, next) => {
    try {
        if (User.findById(req.params.id) === null) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        const jobs = await Job.find({ created_by: req.params.id });
        if (jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found"
            })
        }
        res.status(200).json({
            message: "Jobs fetched successfully",
            data: {
                user : req.params.id,
            }
        })
    } catch (error) {
        next(error);
    }}

// Update job
exports.updateJob = async (req, res, next) => {
    try {
        const job = await job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }
        await job.updateOne(req.body);
        // we have to take the id of the user who updated the job from the token
        // should update_at be updated manually or automatically
        res.status(200).json({
            message: "Job updated successfully",
            data: job
        })
    } catch (error) {
        next(error);
    }
}

// Delete job
exports.deleteJob = async (req, res, next) => {
    try {
        const job = await job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }
        await job.deleteOne();
        res.status(200).json({
            message: "Job deleted successfully",
            data: job
        })
    } catch (error) {
        next(error);
    }
}