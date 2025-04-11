const express = require("express");
const s3Router = express.Router();
const { s3Controller } = require("../controllers/index");
const {
  authenticateToken,
  authorizeRole,
} = require("../middlewares/auth.middleware");
const { hasPermission } = require("../middlewares/permission.middleware");
// Need a middleware to decode token, will do it later and add to routes
// const { authenticateToken } = require("../middlewares/auth.middleware");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


s3Router.post("/upload/:id",
  upload.array("file",5),
  authenticateToken, 
  authorizeRole(["HR"]), 
  hasPermission(["UPLOAD_CANDIDATE_CV"]), 
  s3Controller.uploadFileWhenCreate
);

s3Router.post("/upload/:id/:rec_id",
  upload.array("file",5), 
  authenticateToken, 
  authorizeRole(["HR"]), 
  hasPermission(["UPLOAD_CANDIDATE_CV"]), 
  s3Controller.uploadFileWhenUpdate
);

s3Router.delete("/delete/:id", 
  authenticateToken, 
  authorizeRole(["HR"]), 
  s3Controller.deleteFilesOnS3 
);

s3Router.delete("/delete", 
  authenticateToken, 
  authorizeRole(["HR"]), 
  s3Controller.deleteSingleFileOnS3
);

s3Router.get("/file-exist/:fileName", 
  authenticateToken, 
  authorizeRole(["HR", "Admin"]), 
  s3Controller.checkFileExistsOnS3
);

module.exports = s3Router;
