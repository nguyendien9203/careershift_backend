const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(?:\+84|0)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    cvUrl: {
      type: String,
    },
    source: {
      type: String,
      enum: {
        values: ["VIETNAMWORKS", "TOPCV", "LINKEDIN"],
        message: "Source must be one of: VIETNAMWORKS, TOPCV, LINKEDIN",
      },
      required: [true, "Candidate source is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["AVAILABLE", "HIRED", "REJECTED"],
        message: "Status must be one of: AVAILABLE, HIRED, REJECTED",
      },
      default: "AVAILABLE",
    },
    isPotential: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("Candidate", candidateSchema);