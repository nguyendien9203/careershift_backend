const express = require("express");
const s3Router = express.Router();
const {
  uploadSingleFile,
  deleteFileOnS3,
  checkFileExistsOnS3,
} = require("../controllers/s3.controllers");
// Need a middleware to decode token, will do it later and add to routes
const { authenticateToken } = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

s3Router.post("/upload", upload.single("file"), uploadSingleFile);
s3Router.delete("/delete/:fileName", deleteFileOnS3);
s3Router.get("/file-exist/:fileName", checkFileExistsOnS3);

module.exports = s3Router;
