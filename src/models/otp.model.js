const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    value: {
      type: Number,
      required: [true, "Token value is required"],
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);
