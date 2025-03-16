const {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const connectS3 = require("../config/aws-s3");
const Candidate = require("../models/candidate.model");
const Recruitment = require("../models/recruitment.model");
const Job = require("../models/job.model");
// const { param } = require("../routes/s3.route");

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
    const { name, email, phone, source, notes} = req.body;
    const candidate = await Candidate.findOne({ email }).lean();
    const job = await Job.findById(req.params.id);
    const uploadedFileName = req.files.map((file) =>
      file.originalname.toLowerCase().replace(/\s+/g, "_")
    );
    
    let cvFile;

    // If this recruitment has already existed
    if (candidate) {
      console.log("Candidate: ",candidate);
      const recruitmentSame =  await Recruitment.findOne({ jobId: job._id.toString(), candidateId: candidate._id.toString(), "cvFile.fileName": uploadedFileName[0] }).lean();
      console.log("Recruitment: ",recruitmentSame);
      const recruitment = await Recruitment.findOne({ jobId: job._id.toString(), candidateId: candidate._id.toString() }).lean();
    // Check if user data already exists in recruitment
    if(recruitment) {
      
    // Check if user data already exists but new CV is uploaded
    if (recruitment.candidateId.toString() === candidate._id.toString() && recruitment.cvFile.fileName !== uploadedFileName[0]) {
    
      const uploadParams = {
        Bucket: bucketName,
        Key: uploadedFileName[0],
        Body: req.files[0].buffer,
        ContentType: req.files[0].mimetype,
      }

      const deleteParams = {
        Bucket: bucketName,
        Key: recruitment.cvFile.fileName,
      }
      
      await s3Client.send(new PutObjectCommand(uploadParams));
      await s3Client.send(new DeleteObjectCommand(deleteParams));
      recruitment.cvFile.fileName = uploadedFileName[0];
      recruitment.cvFile.uploadedAt = new Date();
      recruitment.save;

      cvFile = recruitment.cvFile,
      
      res.status(200).json({
        message: `Updated CV for ${email} successfully`,
        candidate: {
          name,
          email,
          phone,
          source
        },
        cvFile,
        notes,
        continued : false
      });
    }
  }
    if (recruitmentSame) {
    if ((recruitment.candidateId.toString() === candidate._id.toString()) && (recruitment.cvFile.fileName === uploadedFileName[0])) {
      res.status(400).json({ error: `User ${email} with CV ${uploadedFileName[0]} has already existed` });
    }
  }
}

  else {
    
    const uploadParams = {
      Bucket: bucketName,
      Key: uploadedFileName[0],
      Body: req.files[0].buffer,
      ContentType: req.files[0].mimetype,
    }
  
    await s3Client.send(new PutObjectCommand(uploadParams));
    cvFile = {
      fileName: uploadedFileName[0],
      uploadedAt: new Date(),
    };

    res.status(200).json({
      message: `Uploaded CV for ${email} successfully`,
      candidate: {
        name,
        email,
        phone,
        source
      },
      cvFile,
      notes,
      continued: true
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
    const recruitment = await Recruitment.findById(req.params.rec_id).lean();
    let { name, email, phone, source, isPotential,  status, notes  } = req.body;
    const candidate = { name, email, phone, source, isPotential };
    
    let cvFile = recruitment.cvFile;

    if (req.files.length === 0) {
      return res.status(200).json({
        message: "No file uploaded",
        candidate,
        status,
        notes,
        cvFile  
      });
    }
    // Connect to S3
    const s3Client = connectS3();
    const uploadedParams = {
      Bucket: bucketName,
      Key: req.files[0].originalname.toLowerCase().replace(/\s+/g, "_"),
      Body: req.files[0].buffer,
      ContentType: req.files[0].mimetype
    };

    cvFile = {
      fileName: req.files[0].originalname.toLowerCase().replace(/\s+/g, "_"),
      uploadedAt: new Date(),
    };
    await s3Client.send(new PutObjectCommand(uploadedParams));
    res.status(200).json({
      message: "File uploaded successfully",
      candidate,
      status,
      notes,
      cvFile
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete file
exports.deleteFilesOnS3 = async (req, res) => {
  try {
    // Connect to S3
    const recruitment = await Recruitment.findById(req.params.id);
    const s3Client = connectS3();
    const params = {
      Bucket: bucketName,
      Key: recruitment.cvFile.fileName,
    }
    await s3Client.send(new DeleteObjectCommand(params));
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
