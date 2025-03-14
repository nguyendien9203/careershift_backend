
const Interview = require('../models/Interview');
const User = require('../models/User');
const mongoose = require('mongoose')


// Xem phỏng vấn theo Recruitment
const getInterviewsByRecruitment = async (req, res) => {
    try {
        const { recruitmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(recruitmentId)) {
            return res.status(400).json({ success: false, message: 'Invalid recruitment ID' });
        }

        const interviews = await Interview.find({ recruitmentId })
            .populate('stages.interviewerIds', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({ success: true, count: interviews.length, data: interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Xem các phỏng vấn sắp tới
const getUpcomingInterviews = async (req, res) => {
    try {
        const today = new Date();
        const interviews = await Interview.find({ date: { $gte: today } })
            .populate('stages.interviewerIds', 'name email')
            .populate('recruitmentId', 'candidateId jobId');

        res.status(200).json({ success: true, count: interviews.length, data: interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};


module.exports = {
    getInterviewsByRecruitment,
    getUpcomingInterviews
   
};
