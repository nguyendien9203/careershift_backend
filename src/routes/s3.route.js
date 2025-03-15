const express = require("express");
const s3Router = express.Router();

const {
  uploadFileWhenUpdate,
  deleteFilesOnS3,
  checkFileExistsOnS3,
  deleteSingleFileOnS3,
  uploadFileWhenCreate
} = require("../controllers/s3.controllers");
// Need a middleware to decode token, will do it later and add to routes
const { authenticateToken } = require("../middlewares/auth.middleware");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


s3Router.post("/upload", upload.array("file",5), uploadFileWhenCreate);
s3Router.post("/upload/:id", upload.array("file",5), uploadFileWhenUpdate);
s3Router.delete("/delete/:id", deleteFilesOnS3 );
s3Router.delete("/delete", deleteSingleFileOnS3);
s3Router.get("/file-exist/:fileName", checkFileExistsOnS3);

module.exports = s3Router;
