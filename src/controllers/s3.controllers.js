const { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand} = require('@aws-sdk/client-s3');
const { connectS3 } = require("../config/aws-s3");
const Candidate = require("../models/candidate.model");


const bucketName = 'career-shift';
const prefixS3 = 'https://career-shift.s3.ap-south-1.amazonaws.com';

// Upload single file to S3
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Connect to S3
        const s3Client = connectS3();

        const {name, email, phone, source, type} = req.body;
        const candidate = await Candidate.findOne({ email });
        const uploadedFileName = req.file.map(file => file.originalname.toLowerCase().replace(/\s+/g, '_'));
        let cvFile = [];

        if (candidate) {
            const candidateCurrentFiles = candidate.cvFile.map(file => file.fileName);
            if (type === 'update') {
            // Delete file that in cadidateCurrentFiles but not in uploadedFileName
               const deleteFile = candidateCurrentFiles.filter(file => !uploadedFileName.includes(file));
               for (let i = 0; i < deleteFile.length; i++) {
                   const params = {
                       Bucket : bucketName,
                       Key : deleteFile[i]
                   }
                   await s3Client.send(new DeleteObjectCommand(params))
               }
            // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
               const updateFile = uploadedFileName.filter(file => !candidateCurrentFiles.includes(file));
               for (let i = 0; i < updateFile.length; i++) {
                   const uploadedFile = req.file.filter(file => file.originalname.toLowerCase().replace(/\s+/g, '_') === updateFile[i]);
                   const updateParams = {
                       Bucket : bucketName,
                       Key : updateFile[i],
                       Body : uploadedFile.buffer,
                       ContentType: uploadedFile.mimetype
                   }
                   await s3Client.send(new PutObjectCommand(updateParams))
                   cvFile.push({ fileName: updateFile[i], uploadedAt: new Date(Date.now()) });
               }

               res.status(200).json({ 
                   message: "Delete removed file and upload new file successfully" ,
                   data: {
                       name: candidate.name,
                       email: candidate.email,
                       phone: candidate.phone,
                       source: candidate.source,
                       cvFile: cvFile
                   }
               });
            } else {
                const updateFile = uploadedFileName.filter(file => !candidateCurrentFiles.includes(file));
                if (updateFile.length === 0) {
                    return res.status(400).json({ error: "User data already exists, file has not changed" });
                }
                for (let i = 0; i < updateFile.length; i++) {
                    const uploadedFile = req.file.filter(file => file.originalname.toLowerCase().replace(/\s+/g, '_') === updateFile[i]);
                    const addedParams = {
                        Bucket : bucketName,
                        Key : updateFile[i],
                        Body : uploadedFile.buffer,
                        ContentType: uploadedFile.mimetype
                    }
                    await s3Client.send(new PutObjectCommand(addedParams))
                }

                res.status(200).json({ 
                    message: "Upload new file successfully" ,
                    data: {
                        name: candidate.name,
                        email: candidate.email,
                        phone: candidate.phone,
                        source: candidate.source,
                        cvFile: candidate.cvFile.concat(updateFile.map(file => ({ fileName: file, uploadedAt: new Date(Date.now()) })))
                    }
                });
            }
        }
        else {
            for (let i = 0; i < uploadedFileName.length; i++) {
                const uploadedFile = req.file.filter(file => file.originalname.toLowerCase().replace(/\s+/g, '_') === uploadedFileName[i]);
                const createdParams = {
                    Bucket : bucketName,
                    Key : uploadedFileName[i],
                    Body : uploadedFile.buffer,
                    ContentType: uploadedFile.mimetype
                }
                await s3Client.send(new PutObjectCommand(createdParams))
            }

            res.status(200).json({ 
                message: "File uploaded successfully" ,
                data: {
                    name,
                    email,
                    phone,
                    source,
                    cvFile
                }
            });
        }
    
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete file
exports.deleteFileOnS3 = async (req, res) => {
    try {
        // Connect to S3
        const s3Client = connectS3();
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        const deletedFiles = candidate.cvFile.filter(file => file.fileName);
        if (deletedFiles.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }
        for (let i = 0; i < deletedFiles.length; i++) {
            const params = {
                Bucket : bucketName,
                Key : deletedFiles[i].fileName
            }
            await s3Client.send(new DeleteObjectCommand(params))

        }
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