const { format } = require("morgan");
const Job = require("../models/job.model");
const User = require("../models/user.model");

// Create job
exports.createJob = async (req, res, next) => {
    try {
        const {title, source_url, created_by, updated_by} = req.body;
        // We need to get the user id by decode the token, this will be done in the middleware
        // Should I validate userId ?
        // let token = req.headers.authorization;

        // created_by = req.user._id;
        // updated_by = req.user._id;

        const newJob = new Job({
            title,
            source_url,
            createdBy : created_by,
            updatedBy: updated_by
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
exports.getJobsByUserId = async (req, res, next) => {
    try {
        // By default mongoose queries return an instance of Mongoose document class
        // Convert mongoose object to json for modify + lighter than mongoose document
        // https://mongoosejs.com/docs/tutorials/lean.html
        const createdUser = await User.findById(req.body.createdBy);
        if (!createdUser) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        const jobs = await Job.find({createdBy: req.body.createdBy}).populate("createdBy", "name" ).populate("updatedBy", "name").lean();

        const formattedJobs = jobs.map(job => ({
            ...job,
            createdBy: job.createdBy.name,
            updatedBy: job.updatedBy.name
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
        const job = await Job.findById(req.params.id).populate("createdBy", "name" ).populate("updatedBy", "name").lean();
        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }
        const formattedJob = {
            ...job,
            createdBy: job.createdBy.name,
            updatedBy: job.updatedBy.name
        }
        if (!formattedJob) {
            return res.status(404).json({
                message: "Job not found"
            })
        }
        res.status(200).json({
            message: "Job fetched successfully",
            data: formattedJob
        })
    } catch (error) {
        next(error);
    }
}

// Get job by UserID
exports.getJobs = async (req, res, next) => {
    try {
        
        const jobs = await Job.find();
        if (jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found"
            })
        }
        res.status(200).json({
            message: "Jobs fetched successfully",
            data: jobs
        })
    } catch (error) {
        next(error);
    }}

// Update job
exports.updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }
        await Job.updateOne({_id: req.params.id},req.body);
        // we have to take the id of the user who updated the job from the token
        // should update_at be updated manually or automatically
        // await job.save();
        res.status(200).json({
            message: "Job updated successfully",
            data: await Job.findById(req.params.id)
        })
    } catch (error) {
        next(error);
    }
}

// Delete job
exports.deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
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