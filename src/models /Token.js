const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    value: {
      type: String,
      required: [true, "Token value is required"],
      unique: true,
    },
    type: {
      type: String,
      enum: {
        values: ["JWT"],
        message: "Token type must be 'JWT'",
      },
      default: "JWT",
    },
    purpose: {
      type: String,
      enum: {
        values: ["RESET_PASSWORD", "REFRESH_TOKEN"],
        message: "Purpose must be either 'RESET_PASSWORD' or 'REFRESH_TOKEN'.",
      },
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    expired: {
      type: Date,
      required: [true, "Expiration date is required."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);
