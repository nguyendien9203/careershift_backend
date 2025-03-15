const {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const connectS3 = require("../config/aws-s3");
const Candidate = require("../models/candidate.model");

const bucketName = "career-shift";
const prefixS3 = "https://career-shift.s3.ap-south-1.amazonaws.com";

// Upload files to S3 when created
exports.uploadFileWhenCreate = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Connect to S3
    const s3Client = connectS3();
    // return res.status(200).json(req.files);
    const { name, email, phone, source, type } = req.body;
    const candidate = await Candidate.findOne({ email }).lean();
    const uploadedFileName = req.files.map((file) =>
      file.originalname.toLowerCase().replace(/\s+/g, "_")
    );
    let cvFile = [];

    if (candidate) {
      if (candidate.cvFile) {
        candidate.cvFile = candidate.cvFile.map(({ fileName, uploadedAt }) => ({
          fileName,
          uploadedAt,
        }));
      }
      const candidateCurrentFiles = candidate.cvFile.map(
        (file) => file.fileName
      );

      const updateFile = uploadedFileName.filter(
        (file) => !candidateCurrentFiles.includes(file)
      );
      const fileNotChanged = uploadedFileName.filter((file) =>
        candidateCurrentFiles.includes(file)
      );
      if (updateFile.length === 0) {
        return res
          .status(400)
          .json({
            error: `User data already exists, file ${fileNotChanged} has not changed`,
          });
      }
      for (let i = 0; i < updateFile.length; i++) {
        const uploadedFile = req.files.filter(
          (file) =>
            file.originalname.toLowerCase().replace(/\s+/g, "_") ===
            updateFile[i]
        );
        const addedParams = {
          Bucket: bucketName,
          Key: updateFile[i],
          Body: uploadedFile[0].buffer,
          ContentType: uploadedFile[0].mimetype,
        };
        await s3Client.send(new PutObjectCommand(addedParams));
      }
      // console.log(candidate);
      res.status(200).json({
        message: "Upload new file successfully",
        data: {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          source: candidate.source,
          cvFile: candidate.cvFile.concat(
            updateFile.map((file) => ({
              fileName: file,
              uploadedAt: new Date(Date.now()),
            }))
          ),
        },
      });
      // }
    } else {
      for (let i = 0; i < uploadedFileName.length; i++) {
        const uploadedFile = req.files.filter(
          (file) =>
            file.originalname.toLowerCase().replace(/\s+/g, "_") ===
            uploadedFileName[i]
        );
        cvFile.push({
          fileName: uploadedFileName[i],
          uploadedAt: new Date(Date.now()),
        });
        console.log(uploadedFileName[i]);
        console.log(uploadedFile);
        const createdParams = {
          Bucket: bucketName,
          Key: uploadedFileName[i],
          Body: uploadedFile[0].buffer,
          ContentType: uploadedFile[0].mimetype,
        };
        console.log(createdParams);
        await s3Client.send(new PutObjectCommand(createdParams));
      }

      res.status(200).json({
        message: "File uploaded successfully",
        data: {
          name,
          email,
          phone,
          source,
          cvFile,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Upload files to S3 when updated
exports.uploadFileWhenUpdate = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Connect to S3
    const s3Client = connectS3();
    const candidate = await Candidate.findById(req.params.id).lean();
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    const uploadedFileName = req.files.map((file) =>
      file.originalname.toLowerCase().replace(/\s+/g, "_")
    );
    if (candidate.cvFile) {
      candidate.cvFile = candidate.cvFile.map(({ fileName, uploadedAt }) => ({
        fileName,
        uploadedAt,
      }));
    }
    const candidateCurrentFiles = candidate.cvFile.map((file) => file.fileName);

    const updateFile = uploadedFileName.filter(
      (file) => !candidateCurrentFiles.includes(file)
    );
    const fileNotChanged = uploadedFileName.filter((file) =>
      candidateCurrentFiles.includes(file)
    );
    if (updateFile.length === 0) {
      return res
        .status(400)
        .json({
          error: `User data already exists, file ${fileNotChanged} has not changed`,
        });
    }
    for (let i = 0; i < updateFile.length; i++) {
      const uploadedFile = req.files.filter(
        (file) =>
          file.originalname.toLowerCase().replace(/\s+/g, "_") === updateFile[i]
      );
      const addedParams = {
        Bucket: bucketName,
        Key: updateFile[i],
        Body: uploadedFile[0].buffer,
        ContentType: uploadedFile[0].mimetype,
      };
      await s3Client.send(new PutObjectCommand(addedParams));
    }
    // console.log(candidate);
    res.status(200).json({
      message: "Upload new file successfully",
      data: {
        cvFile: candidate.cvFile.concat(
          updateFile.map((file) => ({
            fileName: file,
            uploadedAt: new Date(Date.now()),
          }))
        ),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete file
exports.deleteFilesOnS3 = async (req, res) => {
  try {
    // Connect to S3
    const s3Client = connectS3();
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    const deletedFiles = candidate.cvFile.filter((file) => file.fileName);
    if (deletedFiles.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }
    for (let i = 0; i < deletedFiles.length; i++) {
      const params = {
        Bucket: bucketName,
        Key: deletedFiles[i].fileName,
      };
      await s3Client.send(new DeleteObjectCommand(params));
    }
    res.status(200).json({
      message: "File deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteSingleFileOnS3 = async (req, res) => {
  try {
    // Connect to S3
    const s3Client = connectS3();
    const params = {
      Bucket: bucketName,
      Key: req.body.fileName,
    };
    await s3Client.send(new DeleteObjectCommand(params));
    res.status(200).json({
      message: "File deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Check if file exists
exports.checkFileExistsOnS3 = async (req, res) => {
  try {
    // Connect to S3
    const s3Client = connectS3;
    const params = {
      Bucket: bucketName,
      Key: req.params.fileName,
    };
    await s3Client.send(new HeadObjectCommand(params));
    res.status(200).json({
      message: "File exists",
      url: `${prefixS3}/${req.body.fileName}`,
    });
  } catch (error) {
    if (error.name === "NotFound") {
      res.status(404).json({
        message: "File not found",
      });
    }
    return res.status(500).json({ error: error.message });
  }
};
