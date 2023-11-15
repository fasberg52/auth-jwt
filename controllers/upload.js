// controllers/upload.js

const { getManager } = require("typeorm");
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

    const path  =  req.file.originalname;
    
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
      message: "Image uploaded successfully",
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
  // Implement the logic to retrieve an upload by ID
}
async function getUploadById(req, res) {
    // Implement the logic to retrieve an upload by ID
  }
  

async function updateUpload(req, res) {
  // Implement the logic to update an upload by ID
}

async function deleteUpload(req, res) {
  // Implement the logic to delete an upload by ID
}

module.exports = {
  createUpload,
  getAllUploads,
  getUploadById,
  updateUpload,
  deleteUpload,
};
