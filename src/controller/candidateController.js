const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");

exports.getAllCandidates = async (req, res, next) => {
    try {
        const candidates = await Candidate.find();
        res.json(candidates);
    } catch (error) {
        next(error);
    }
}