const { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand} = require('@aws-sdk/client-s3');
const { connectS3 } = require("../config/aws-s3");


const bucketName = 'career-shift';
const prefixS3 = 'https://career-shift.s3.ap-south-1.amazonaws.com';

// Upload single file to S3
exports.uploadSingleFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Connect to S3
        const s3Client = connectS3();
        // Format file name to store
        const fileName = req.file.originalname.toLowerCase().replace(/\s+/g, '_')
        const params = {
            Bucket : bucketName,
            Key : fileName,
            Body : req.file.buffer,
            ContentType: req.file.mimetype
        }
    
        await s3Client.send(new PutObjectCommand(params))
            res.status(200).json({ 
                message: "File uploaded successfully" ,
                url : `${prefixS3}/${fileName}`
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete file
exports.deleteFileOnS3 = async (req, res) => {
    try {
        // Connect to S3
        const s3Client = connectS3();
        const params = {
            Bucket : bucketName,
            Key : req.params.fileName
        }
        await s3Client.send(new DeleteObjectCommand(params))
            res.status(200).json({ 
                message: "File deleted successfully"  
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Check if file exists
exports.checkFileExistsOnS3 = async (req, res) => {
    try {
        // Connect to S3
        const s3Client = connectS3();
        const params = {
            Bucket : bucketName,
            Key : req.params.fileName
        }
        await s3Client.send(new HeadObjectCommand(params))
            res.status(200).json({ 
                message: "File exists",
                url : `${prefixS3}/${req.body.fileName}`
        });
    } catch (error) {
        if (error.name === 'NotFound') {
            res.status(404).json({
                message: "File not found"
            })
        }
        return res.status(500).json({ error: error.message });
    }
};