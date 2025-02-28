const Interview = require("../models/Interview");

// Lấy danh sách lịch phỏng vấn (Get ALL)
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

module.exports = { getInterviews };
