const Interview = require("../models/Interview");

// Create an Interview
exports.createInterview = async (req, res, next) => {
    try {
        const { recruitmentId, stages, date, time, mode, address, google_meet_link } = req.body;
        const createdBy = req.user._id;
        const updatedBy = req.user._id;

        const newInterview = new Interview({
            recruitmentId,
            stages,
            finalStatus: "IN_PROGRESS",
            date,
            time,
            mode,
            address,
            google_meet_link,
            createdBy,
            updatedBy,
        });

        await newInterview.save();
        res.status(201).json({ message: "Interview created successfully", data: newInterview });
    } catch (error) {
        next(error);
    }
};

// Get all Interviews
exports.getInterviews = async (req, res, next) => {
    try {
        const interviews = await Interview.find()
            .populate("recruitmentId", "title")
            .populate("createdBy", "name")
            .populate("updatedBy", "name")
            .lean();

        if (!interviews.length) {
            return res.status(404).json({ message: "No interviews found" });
        }
        res.status(200).json({ message: "Interviews fetched successfully", data: interviews });
    } catch (error) {
        next(error);
    }
};

// Get Interview by ID
exports.getInterviewById = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate("recruitmentId", "title")
            .populate("createdBy", "name")
            .populate("updatedBy", "name");

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        res.status(200).json({ message: "Interview fetched successfully", data: interview });
    } catch (error) {
        next(error);
    }
};

// Update Interview
exports.updateInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        
        req.body.updatedBy = req.user._id;
        await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Interview updated successfully", data: interview });
    } catch (error) {
        next(error);
    }
};

// Delete Interview
exports.deleteInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        await interview.deleteOne();
        res.status(200).json({ message: "Interview deleted successfully" });
    } catch (error) {
        next(error);
    }
};