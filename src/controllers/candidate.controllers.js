const Candidate = require("../models/candidate.model");
const { updateJob } = require("./job.controller");
const { uploadSingleFile, deleteFileOnS3, uploadMultipleFiles} = require("../controllers/s3.controller");
// Create candidate
exports.createCandidate = async (req, res) => {
    // Decode the token and get the user id there
    // let token = req.headers.authorization;
    try {
        const {name, email, phone, source, cvFile} = req.body;
        createdBy = req.user._id;
        updatedBy = req.user._id;
        if (await Candidate.findOne({ 
            $or: [{ email }, { phone }]
        })) {
           const candidate = await Candidate.findOne({ email });
           candidate.cvFile = cvFile
           candidate.updatedBy = updatedBy
           await candidate.save();
           return res.status(200).json({
                message: "Candidate already exists ",
                data: candidate });
        }
        const newCandidate = new Candidate({
            name,
            email,
            phone,
            cvFile,
            source,
            createdBy,
            updatedBy
        })
        await newCandidate.save();
        res.status(201).json({ message: "Candidate created successfully", data: newCandidate });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update candidate
exports.updateCandidate = async (req, res) => {
    // Decode the token and get the user id there
    // let token = req.headers.authorization;
    updatedBy = req.user._id;
    const candidate = await Candidate.findById(req.params.id);
    // Check if candidate exists
    if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
    }
    try {
        await candidate.updateOne(req.body);
        res.status(200).json({ message: "Candidate updated successfully", data: candidate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Delete candidate
exports.deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        await candidate.deleteOne();
        res.status(200).json({ message: "Candidate deleted successfully", data: candidate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Get all candidates
exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find();
        if (candidates.length === 0) {
            return res.status(404).json({ message: "No candidates found" });
        }
        res.status(200).json({ message: "Candidates fetched successfully", data: candidates });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// Get candidate by id
exports.getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }
        res.status(200).json({ message: "Candidate fetched successfully", data: candidate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

exports.getCandidateByUserCreatedId = async (req, res) => {
    try {
        const candidates = await Candidate.find({ createdBy: req.params.id });
        if (candidates.length === 0) {
            return res.status(404).json({ message: "No candidates found" });
        }
        res.status(200).json({ message: "Candidates fetched successfully", data: candidates });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

