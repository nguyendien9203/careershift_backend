const Candidate = require("../models/candidate.model");
const { updateJob } = require("./job.controller");
const { uploadSingleFile, deleteFileOnS3} = require("../controllers/s3.controller");
// Create candidate
exports.createCandidate = async (req, res) => {
    // Decode the token and get the user id there
    // let token = req.headers.authorization;
    try {
        const {name, email, phone, cvFile, source} = req.body;
        createdBy = req.user._id;
        updatedBy = req.user._id;
        if (Candidate.findOne({ email }) || Candidate.findOne({ phone })) {
            // Find candidate by email or phone
            const candidate = await Candidate.findOne({ email });
            const candidate_cvFile = candidate.cvFile;
            // Check cvFile of candidate
            // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
            const diff_cvFile = candidate_cvFile.filter(x => !cvFile.includes(x));
            if (diff_cvFile.length > 0) {
                for (let i = 0; i < diff_cvFile.length; i++) {
                    const uploadedFile = req.file.filter(file => file.originalname === diff_cvFile[i])[0];
                    req.file = uploadedFile;
                    await uploadSingleFile(req, res);
                }
                return res.status(200).json({ message: "Candidate already exists but CV is updated" });
            }
            // Add if not exist, don't update if exist
            if (diff_cvFile.length = 0) {
                return res.status(400).json({ message: "Candidate CV already exists" });
            }
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
    const candidate = await Candidate.findById(req.params.id);

    // Check if candidate exists
    if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
    }
    // Check candidate cvFile compare to req.body.cvFile
    const diff_cvFile = candidate.cvFile.filter(x => !req.body.cvFile.includes(x));
    if (diff_cvFile.length > 0) {
        for (let i = 0; i < diff_cvFile.length; i++) {
            await uploadSingleFile(req, res);
        }
    }
    // Check any added cvFile, any deleted cvFile
    if (diff_cvFile.length = 0) {
        for (let i = 0; i < req.body.cvFile.length; i++) {
            await deleteFileOnS3(req, res);
        }
    }
    // Delete cvFile if not exist in req.body, upload if exist
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

