const { sendEmail } = require("../config/mailer");
const { getCompletedComparisons } = require("./candidateComparisonController");

exports.sendEmailToCandidates = async (req, res) => {
    try {
        // Lấy danh sách ứng viên đã trúng tuyển

        const candidates = await getCompletedComparisons();

        if (!candidates || candidates.length === 0) {
            return res.status(200).json({ message: "Không có ứng viên nào để gửi email." });
        }
        console.log("📌 Danh sách ứng viên:", JSON.stringify(candidates, null, 2));

         // Duyệt qua từng công việc và các ứng viên trúng tuyển
         candidates.forEach((comparison) => {
            const { job, selectedCandidates } = comparison;

            selectedCandidates.forEach((candidate) => {
                if (!candidate.email || !candidate.name) {
                    console.error(`❌ Thiếu thông tin ứng viên: ${JSON.stringify(candidate)}`);
                    return;
                }

                console.log(`📩 Đang gửi email đến: ${candidate.email} - Vị trí: ${job.title}`);

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
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
