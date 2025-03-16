const authController = require("./auth.controllers");
const userController = require("./user.controllers");
const roleController = require("./role.controllers");
const recruitmentController = require("./recruitment.controllers");
const jobController = require("./job.controllers");
const s3Controller = require("./s3.controllers");

module.exports = {
  authController,
  userController,
  roleController,
  recruitmentController,
  jobController,
  s3Controller,
};
