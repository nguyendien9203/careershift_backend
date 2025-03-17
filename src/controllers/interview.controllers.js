const Interview = require("../models/interview.model");
const Candidate = require("../models/candidate.model");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Recruitment = require("../models/recruitment.model");
const mongoose = require("mongoose");
// Get all interviews
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find();

    return res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching interviews",
      error: error.message,
    });
  }
};

// Get interview by ID
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const interview = await Interview.findById(id)
      .populate("recruitmentId", "candidateId jobJd status")
      .populate("stages.interviewerIds", "name email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });
    }

    return res.status(200).json({ success: true, data: interview });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Create new interview

const createInterview = async (req, res) => {
  try {
    const {
      recruitmentId,
      finalStatus,
      date,
      time,
      mode,
      address,
      google_meet_link,
    } = req.body;

    console.log("Received recruitmentId:", recruitmentId); // Debug log

    // Validate recruitmentId format
    if (!mongoose.Types.ObjectId.isValid(recruitmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid recruitment ID format" });
    }

    // Check if recruitment exists and has INTERVIEW status
    const recruitment = await Recruitment.findById(recruitmentId);
    console.log("Found recruitment:", recruitment); // Debug log
    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy recruitment với ID: ${recruitmentId}`,
      });
    }

    // Check recruitment status
    if (recruitment.status !== "INTERVIEW") {
      return res.status(400).json({
        success: false,
        message:
          "Chỉ có thể tạo lịch phỏng vấn khi recruitment ở trạng thái INTERVIEW",
      });
    }

    // Validate required fields
    if (!date || !time || !mode) {
      return res.status(400).json({
        success: false,
        message: "Date, time, and mode are required",
      });
    }

    // Validate mode
    if (!["ONLINE", "OFFLINE"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be either ONLINE or OFFLINE",
      });
    }

    // Handle mode-specific validations
    let finalGoogleMeetLink = google_meet_link;
    let finalAddress = address;

    if (mode === "ONLINE") {
      // Không bắt buộc phải có google_meet_link, nhưng nếu có thì lưu lại
      finalAddress = undefined; // Clear address for ONLINE mode
    } else if (mode === "OFFLINE") {
      if (!address) {
        return res.status(400).json({
          success: false,
          message: "Address is required for OFFLINE mode",
        });
      }
      finalGoogleMeetLink = undefined; // Clear Google Meet link for OFFLINE mode
    }

    // Create new interview
    const newInterview = new Interview({
      recruitmentId,
      finalStatus: finalStatus || "IN_PROGRESS",
      date,
      time,
      mode,
      address: finalAddress,
      google_meet_link: finalGoogleMeetLink,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
      stages: [], // Khởi tạo stages rỗng (có thể thêm logic để tạo stages nếu cần)
    });

    const savedInterview = await newInterview.save();

    return res.status(201).json({
      success: true,
      message: "Interview created successfully",
      data: savedInterview,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating interview",
      error: error.message,
    });
  }
};

const updateInterviewStage = async (req, res) => {
  try {
    const { interviewId, round, interviewerId, score, comments } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!interviewId || !round || !interviewerId) {
      return res.status(400).json({
        success: false,
        message: "interviewId, round và interviewerId là bắt buộc",
      });
    }

    // Kiểm tra ID hợp lệ
    if (
      !mongoose.Types.ObjectId.isValid(interviewId) ||
      !mongoose.Types.ObjectId.isValid(interviewerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    // Chuẩn bị và kiểm tra điểm nếu có
    let scoreMap;
    if (score) {
      if (typeof score !== "object" || Object.keys(score).length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Điểm phải là một đối tượng không rỗng chứa tiêu chí và giá trị",
        });
      }

      const scoreEntries = Object.entries(score);
      const scoresValid = scoreEntries.every(([key, value]) => {
        const isValid = Number.isFinite(value) && value >= 0 && value <= 10;
        if (!isValid) {
          console.log(
            `Điểm không hợp lệ cho ${key}: ${value} (kiểu: ${typeof value})`
          );
        }
        return isValid;
      });

      if (!scoresValid) {
        return res.status(400).json({
          success: false,
          message: "Tất cả điểm số phải là số từ 0 đến 10",
        });
      }

      scoreMap = new Map(scoreEntries);
    }

    // Chuẩn bị dữ liệu đánh giá
    const evaluationData = {
      interviewerId,
      ...(scoreMap && { score: scoreMap }),
      ...(comments && { comments }),
    };

    // Tìm phỏng vấn để kiểm tra trước
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phỏng vấn",
      });
    }

    // Tìm vòng phỏng vấn
    const stage = interview.stages.find((s) => s.round === round);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy vòng ${round}`,
      });
    }

    // Kiểm tra quyền
    if (!stage.interviewerIds.some((id) => id.equals(interviewerId))) {
      return res.status(403).json({
        success: false,
        message: "Không được phép đánh giá vòng này",
      });
    }

    // Kiểm tra xem đánh giá đã tồn tại chưa
    const evaluationIndex = stage.evaluations.findIndex((e) =>
      e.interviewerId.equals(interviewerId)
    );

    let updateResult;
    if (evaluationIndex > -1) {
      // Cập nhật đánh giá hiện có
      updateResult = await Interview.updateOne(
        {
          _id: interviewId,
          "stages.round": round,
        },
        {
          $set: {
            [`stages.$.evaluations.${evaluationIndex}`]: evaluationData,
            updatedBy: req.user?._id,
          },
        }
      );
    } else {
      // Thêm đánh giá mới
      updateResult = await Interview.updateOne(
        {
          _id: interviewId,
          "stages.round": round,
        },
        {
          $push: {
            "stages.$.evaluations": evaluationData,
          },
          $set: {
            updatedBy: req.user?._id,
          },
        }
      );
    }

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phỏng vấn hoặc vòng để cập nhật",
      });
    }

    // Lấy tài liệu đã cập nhật để trả về
    const updatedInterview = await Interview.findById(interviewId);

    return res.status(200).json({
      success: true,
      message: `Cập nhật vòng ${round} thành công`,
      data: updatedInterview,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật vòng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error.message,
    });
  }
};
// Update interview
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, mode, address, google_meet_link } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });
    }

    if (date) interview.date = date;
    if (time) interview.time = time;
    if (mode) interview.mode = mode;
    if (mode === "OFFLINE") interview.address = address;
    if (mode === "ONLINE") interview.google_meet_link = google_meet_link;

    const allPassed = interview.stages.every(
      (stage) => stage.status === "PASSED"
    );
    const anyFailed = interview.stages.some(
      (stage) => stage.status === "FAILED"
    );
    interview.finalStatus = anyFailed
      ? "COMPLETED"
      : allPassed
      ? "COMPLETED"
      : "IN_PROGRESS";

    interview.updatedBy = req.user?._id;
    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: interview,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Tạo vòng phỏng vấn cho lịch phỏng vấn
// const createInterviewStage = async (req, res) => {
//   try {
//     const { interviewId, round, type, interviewerIds } = req.body;

//     // Validate interviewId format
//     if (!mongoose.Types.ObjectId.isValid(interviewId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid interview ID format" });
//     }

//     // Check if interview exists
//     const interview = await Interview.findById(interviewId);
//     if (!interview) {
//       return res.status(404).json({
//         success: false,
//         message: `Không tìm thấy interview với ID: ${interviewId}`,
//       });
//     }

//     // Validate required fields
//     if (
//       !round ||
//       !type ||
//       !Array.isArray(interviewerIds) ||
//       interviewerIds.length === 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Round, type, and interviewerIds are required",
//       });
//     }

//     // Validate round number
//     if (round < 1) {
//       return res.status(400).json({
//         success: false,
//         message: "Round number must be at least 1",
//       });
//     }

//     // Check if stage with same round already exists
//     const existingStage = interview.stages.find(
//       (stage) => stage.round === round
//     );
//     if (existingStage) {
//       return res.status(400).json({
//         success: false,
//         message: `Stage with round ${round} already exists`,
//       });
//     }

//     // Validate interview type
//     const validTypes = [
//       "HR_SCREENING",
//       "TECHNICAL_INTERVIEW",
//       "FINAL_INTERVIEW",
//     ];
//     if (!validTypes.includes(type)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Invalid interview type. Must be one of: HR_SCREENING, TECHNICAL_INTERVIEW, FINAL_INTERVIEW",
//       });
//     }

//     // Validate interviewerIds
//     const interviewers = await User.find({ _id: { $in: interviewerIds } });
//     if (interviewers.length !== interviewerIds.length) {
//       return res.status(400).json({
//         success: false,
//         message: "One or more interviewer IDs are invalid",
//       });
//     }

//     // Create new stage
//     const newStage = {
//       round,
//       type,
//       interviewerIds,
//       status: "SCHEDULED",
//       evaluations: [], // Khởi tạo evaluations rỗng
//     };

//     // Add stage to interview
//     interview.stages.push(newStage);
//     await interview.save();

//     return res.status(201).json({
//       success: true,
//       message: "Interview stage created successfully",
//       data: newStage,
//     });
//   } catch (error) {
//     console.error("Error creating interview stage:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while creating interview stage",
//       error: error.message,
//     });
//   }
// };

const updateFinalStatus = async (req, res) => {
  try {
    const { interviewId, finalStatus } = req.body;

    if (!interviewId || !finalStatus) {
      return res.status(400).json({
        success: false,
        message: "interviewId và finalStatus là bắt buộc",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "ID phỏng vấn không hợp lệ",
      });
    }

    if (!["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "finalStatus phải là 'IN_PROGRESS', 'COMPLETED' hoặc 'CANCELLED'",
      });
    }

    const updateResult = await Interview.updateOne(
      { _id: interviewId },
      {
        $set: {
          finalStatus: finalStatus,
          updatedBy: req.user?._id,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phỏng vấn để cập nhật",
      });
    }

    const updatedInterview = await Interview.findById(interviewId);

    return res.status(200).json({
      success: true,
      message: `Cập nhật finalStatus thành ${finalStatus} thành công`,
      data: updatedInterview,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật finalStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi cập nhật finalStatus",
      error: error.message,
    });
  }
};

module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterviewStage,
  updateInterview,
  updateFinalStatus,
};
