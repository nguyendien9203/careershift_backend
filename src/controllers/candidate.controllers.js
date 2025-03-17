const CandidateComparison = require("../models/candidate-comparison.model");

exports.getCompletedComparisons = async () => {
  try {
    const completedComparisons = await CandidateComparison.find({
      status: "COMPLETED",
    })
      .populate("jobId", "title") // Lấy thông tin job (chỉ lấy field 'title')
      .populate("selectedCandidateId", "name email phone"); // Lấy thông tin candidate (name, email, phone)

    if (!completedComparisons.length) {
      console.log("Không có dữ liệu nào với status COMPLETED.");
      return [];
    }

    // Format kết quả trả về
    return completedComparisons.map((comparison) => ({
      job: {
        id: comparison.jobId?._id.toString(),
        title: comparison.jobId?.title || "Unknown",
      },
      selectedCandidates: comparison.selectedCandidateId.map((candidate) => ({
        id: candidate._id.toString(),
        name: candidate.name || "Unknown",
        email: candidate.email || "N/A",
        phone: candidate.phone || "N/A",
      })),
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách so sánh ứng viên hoàn thành:", error);
    throw error;
  }
};

exports.getCompletedCandidateComparisons = async (req, res) => {
  try {
    const completedComparisons = await exports.getCompletedComparisons();
    return res.status(200).json({
      message: "Danh sách các ứng viên và công việc có trạng thái COMPLETED",
      data: completedComparisons,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

exports.sendEmailToCandidates = async (req, res) => {
  try {
    // Lấy danh sách ứng viên đã trúng tuyển

    const candidates = await getCompletedComparisons();

    if (!candidates || candidates.length === 0) {
      return res
        .status(200)
        .json({ message: "Không có ứng viên nào để gửi email." });
    }
    console.log("📌 Danh sách ứng viên:", JSON.stringify(candidates, null, 2));

    // Duyệt qua từng công việc và các ứng viên trúng tuyển
    candidates.forEach((comparison) => {
      const { job, selectedCandidates } = comparison;

      selectedCandidates.forEach((candidate) => {
        if (!candidate.email || !candidate.name) {
          console.error(
            `❌ Thiếu thông tin ứng viên: ${JSON.stringify(candidate)}`
          );
          return;
        }

        console.log(
          `📩 Đang gửi email đến: ${candidate.email} - Vị trí: ${job.title}`
        );

        sendEmail({
          name: candidate.name,
          email: candidate.email,
          jobTitle: job.title, // Lấy tên công việc từ job.title
        });
      });
    });

    return res.status(200).json({ message: "Email đã được gửi thành công!" });
  } catch (error) {
    console.error("❌ Lỗi khi gửi email:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};
