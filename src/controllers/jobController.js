const job = require("../models/job");

exports.createJob = async (req, res, next) => {
    try {
        const {title, platform, source_url, created_by, updated_by} = req.body;
        // We need to get the user id by decode the token, this will be done in the middleware
        created_by = req.user._id;
        updated_by = req.user._id;
        const newJob = new job({
            title,
            platform,
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

exports.getJobs = async (req, res, next) => {
    try {
        const jobs = await job.find();
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
    }
}

exports.getJob = async (req, res, next) => {
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

exports.updateJob = async (req, res, next) => {
    try {
        const job = await job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }
        await job.updateOne(req.body);
        res.status(200).json({
            message: "Job updated successfully",
            data: job
        })
    } catch (error) {
        next(error);
    }
}

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