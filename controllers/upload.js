// controllers/upload.js

const { getManager } = require("typeorm");

const fs = require("fs").promises;
const path = require("path");
const Upload = require("../model/Upload");

async function createUpload(req, res) {
  try {
    // Check if file upload was successful
    if (!req.file) {
      return res.status(400).json({
        message: "File upload failed",
        status: 400,
      });
    }

    const path = req.file.originalname;

    // Handle the case where the file upload was successful, but path is not defined
    if (!path) {
      return res.status(500).json({
        message: "Internal Server Error: File path not generated",
        status: 500,
      });
    }

    const uploadRepository = getManager().getRepository(Upload);

    const newUpload = uploadRepository.create({
      path,
    });

    const saveNewUpload = await uploadRepository.save(newUpload);

    res.status(200).json({
      message: "فایل با موفقیت آپلود شد",
      saveNewUpload,
      status: 200,
    });
  } catch (error) {
    console.error("Error creating upload:", error);

    // Handle the case where an error occurred during the upload process
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
}

async function getAllUploads(req, res) {
  try {
    const uploadRepository = getManager().getRepository(Upload);

    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;

    const skip = (page - 1) * pageSize;

    const [uploads, totalCount] = await uploadRepository.findAndCount({
      skip,
      take: pageSize,
    });

    res.status(200).json({
      message: "All uploads retrieved successfully",
      uploads,
      totalCount,
      status: 200,
    });
  } catch (error) {
    console.error("Error getting all uploads:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
}

async function getUploadById(req, res) {
  try {
    const uploadId = req.params.id;

    const uploadRepository = getManager().getRepository(Upload);

    const upload = await uploadRepository.findOne({ where: { id: uploadId } });

    if (!upload) {
      return res.status(404).json({
        message: "Upload not found",
        status: 404,
      });
    }

    res.status(200).json({
      message: "Upload retrieved successfully",
      upload,
      status: 200,
    });
  } catch (error) {
    console.error("Error getting upload by ID:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
}

async function updateUpload(req, res) {
  // Implement the logic to update an upload by ID
}

async function deleteUpload(req, res) {
  try {
    const uploadId = req.params.id;

    const uploadRepository = getManager().getRepository(Upload);

    const upload = await uploadRepository.findOne({ where: { id: uploadId } });
    console.log(`>>>>> upload${JSON.stringify(upload)}`);
    if (!upload) {
      return res.status(404).json({
        message: "فایلی پیدا نشد",
        status: 404,
      });
    }
    // Remove the file from the uploads folder
    const filePath = path.resolve(__dirname, "../uploads","2023-11",  upload.path);
    console.log(` > >>> filePath : ${filePath}`);
    await fs.unlink(filePath);
    await uploadRepository.remove(upload);

    res.status(200).json({
      message: "فایل با موفقیت پاک شد",
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting upload:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
}

module.exports = {
  createUpload,
  getAllUploads,
  getUploadById,
  updateUpload,
  deleteUpload,
};
