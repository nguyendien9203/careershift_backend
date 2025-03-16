const CandidateComparison = require('../models/candidateComparison.model');
const Recruitment = require("../models/recruitment.model");
const Interview = require("../models/interview.model");
const Candidate = require("../models/candidate.model");

exports.saveCandidateComparison = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { selectedCandidateId } = req.body; // Danh sách ứng viên từ request
  
      if (!selectedCandidateId || !Array.isArray(selectedCandidateId) || selectedCandidateId.length === 0) {
        return res.status(400).json({ message: "Danh sách Selected Candidate ID không hợp lệ!" });
      }
  
      // Bước 1: Lấy danh sách ứng viên thuộc jobId từ bảng Recruitment
      const validCandidates = await Recruitment.find({ jobId }).select("candidateId").lean();
      const validCandidateIds = validCandidates.map((rec) => rec.candidateId.toString());
  
      // Bước 2: Kiểm tra xem tất cả selectedCandidateId có thuộc jobId hay không
      const invalidCandidates = selectedCandidateId.filter(id => !validCandidateIds.includes(id));
  
      if (invalidCandidates.length > 0) {
        return res.status(400).json({
          message: "Có ứng viên không thuộc Job này!",
          invalidCandidates
        });
      }
  
      // Bước 3: Lưu dữ liệu vào MongoDB nếu hợp lệ
      const candidateComparison = new CandidateComparison({
        jobId,
        selectedCandidateId,
      });
  
      await candidateComparison.save();
  
      return res.status(201).json({
        message: "Add Successfully!",
        data: candidateComparison
      });
    } catch (error) {
      console.error("Error: ", error);
      next(error);
    }
  };

  exports.updateCandidateComparison = async (req, res, next) => {
    try {
      const { candidateComparisonId } = req.params;
      const { selectedCandidateId, status } = req.body;
  
      // Tìm CandidateComparison theo ID
      const candidateComparison = await CandidateComparison.findById(candidateComparisonId);
      if (!candidateComparison) {
        return res.status(404).json({ error: "CandidateComparison not found" });
      }
  
      // Lấy jobId từ CandidateComparison
      const { jobId } = candidateComparison;
  
      // Lấy danh sách Candidate từ bảng Recruitment (dựa trên jobId)
      const recruitments = await Recruitment.find({ jobId }).select("candidateId");
      const validCandidateIds = recruitments.map((r) => r.candidateId.toString());
  
      // Kiểm tra xem candidateId có hợp lệ không
      const isValid = selectedCandidateId.every((id) => validCandidateIds.includes(id));
      if (!isValid) {
        return res.status(400).json({ error: "One or more selectedCandidateId are not valid for this job" });
      }
  
      // Cập nhật candidateComparison
      candidateComparison.selectedCandidateId = selectedCandidateId;
      if (status) candidateComparison.status = status;
      await candidateComparison.save();
  
      return res.json({ message: "CandidateComparison updated successfully", candidateComparison });
    } catch (error) {
      console.error("Error updating CandidateComparison:", error);
      next(error);
    }
  };
  
  exports.getAllCandidateComparisons = async (req, res, next) => {
    try {
      // Lấy danh sách CandidateComparison từ database
      const candidateComparisons = await CandidateComparison.find()
        .populate({ path: "jobId", select: "title" }) 
        .populate({ path: "selectedCandidateId", select: "name" })
        .lean();
  
      return res.json({ data: candidateComparisons });
    } catch (error) {
      console.error("Error getting CandidateComparisons:", error);
      next(error);
    }
  };
  