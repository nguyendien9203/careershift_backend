const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    recruitmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruitment",
      required: [true, "Recruitment ID is required"],
    },
    baseSalary: {
      type: Number,
      required: [true, "Base salary is required"],
      min: [0, "Base salary must be a positive number"],
    },
    negotiatedSalary: {
      type: Number,
      min: [0, "Negotiated salary must be a positive number"],
      validate: {
        validator: function (v) {
          return !v || v >= this.baseSalary;
        },
        message:
          "Negotiated salary must be greater than or equal to base salary",
      },
    },
    approvalRequired: {
      type: Boolean,
      default: false,
    },
    salary: {
      type: Number,
      required: [true, "Final salary is required"],
      min: [0, "Salary must be a positive number"],
    },
    status: {
      type: String,
      enum: {
        values: ["SENT", "ACCEPTED", "REJECTED"],
        message: "Status must be one of: SENT, ACCEPTED, REJECTED",
      },
      default: "SENT",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
