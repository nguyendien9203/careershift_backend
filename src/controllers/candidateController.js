const sendMail = require("../config/mailer");
const Candidate = require("../models /Candidate");

exports.sendInterviewEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    if (candidate.status.trim().toUpperCase() !== "AVAILABLE") {
      return res
        .status(400)
        .json({ message: `Candidate has status: ${candidate.status}. Cannot send email.` });
      }

    const acceptLink = `http://localhost:9999/redirect.html?token=HIRED_${email}`;
    const rejectLink = `http://localhost:9999/redirect.html?token=REJECTED_${email}`;

    const emailContent = `
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <h3>Chào ${candidate.name},</h3>
        <p>Bạn đã được mời phỏng vấn!</p>
        <p>Vui lòng xác nhận sự tham gia của bạn bằng cách chọn một trong các lựa chọn dưới đây:</p>
        <a href="${acceptLink}" style="display: inline-block; background-color: green; color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px; margin: 10px;">Accept</a>
        <a href="${rejectLink}" style="display: inline-block; background-color: red; color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px; margin: 10px;">Reject</a>
        <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email <strong>{contact_email}</strong> hoặc số điện thoại <strong>{contact_phone}</strong>.</p>
        <p>Chúng tôi mong sớm nhận được phản hồi từ bạn!</p>
        <p>Trân trọng,</p>
        </div>
    `;

    await sendMail(email, "Lời mời xác nhận phỏng vấn", emailContent);
    return res.json({ message: "Email sent sucessfully!" });
  } catch (error) {
    console.error("Error send email:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { email, status } = req.query;
    if (!email || !status) {
      return res.send(`
        <script>
          alert("Missing email or status information.");
          window.close();
        </script>
      `);
    }
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.send(`
        <script>
          alert("Candidate not found.");
          window.close();
        </script>
      `);
    }
    if (candidate.status === "HIRED" || candidate.status === "REJECTED") {
      return res.send(`
        <script>
          alert("You have already responded.");
          window.close();
        </script>
      `);
    }
    candidate.status = status;
    await candidate.save();
    return res.send(`
      <script>
        alert("Updated successfully! New status: ${status}");
        window.close();
      </script>
    `);
  } catch (error) {
    console.error("Status update error:", error);
    return res.send(`
      <script>
        alert("Server error: ${error.message}");
        window.close();
      </script>
    `);
  }
};
