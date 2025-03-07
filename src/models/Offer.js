// const mongoose = require("mongoose");

// const offerSchema = new mongoose.Schema(
//   {
//     recruitmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Recruitment",
//       required: [true, "Recruitment ID is required"],
//     },
//     baseSalary: {
//       type: Number,
//       required: [true, "Base salary is required"],
//       min: [0, "Base salary must be a positive number"],
//     },
//     negotiatedSalary: {
//       type: Number,
//       min: [0, "Negotiated salary must be a positive number"],
//       validate: {
//         validator: function (v) {
//           return !v || v >= this.baseSalary;
//         },
//         message:
//           "Negotiated salary must be greater than or equal to base salary",
//       },
//     },
//     approvalRequired: {
//       type: Boolean,
//       default: false,
//     },
//     salary: {
//       type: Number,
//       required: [true, "Final salary is required"],
//       min: [0, "Salary must be a positive number"],
//     },
//     status: {
//       type: String,
//       enum: {
//         values: ["SENT", "ACCEPTED", "REJECTED","PENDING"],
//         message: "Status must be one of: SENT, ACCEPTED, REJECTED, PENDING",
//       },
//       default: "SENT",
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Offer", offerSchema);

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
        values: ["SENT", "PENDING", "ACCEPTED", "REJECTED", "MANAGER_APPROVAL", "MANAGER_REJECTED"],
        message: "Status must be one of: SENT, PENDING, ACCEPTED, REJECTED, MANAGER_APPROVAL, MANAGER_REJECTED",
      },
      default: "SENT",
    },
    managerStatus: {
      type: String,
      enum: {
        values: ["PENDING", "APPROVED", "REJECTED"],
        message: "Manager status must be one of: PENDING, APPROVED, REJECTED",
      },
      default: "PENDING",
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
