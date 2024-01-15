// controllers/upload.js

const { getManager } = require("typeorm");
const { createSubdirectory } = require("../utils/multerUtils");
const fs = require("fs");
const path = require("path");
const Upload = require("../model/Upload");
const moment = require("jalali-moment");

async function createUpload(req, res) {
  try {
    console.log("Received file upload request");
    console.log("req.file : " + JSON.stringify(req.file));

    const sizeFile = req.file.size;
    const originalFilename = req.file.originalname;

    const subdirectory = createSubdirectory(new Date());

    const filePath = path.resolve(
      __dirname,
      "../uploads",
      subdirectory,
      originalFilename
    );
    console.log(`filePath >>> ${filePath}`);
    const uploadRepository = getManager().getRepository(Upload);

    const newUpload = uploadRepository.create({
      path: req.uploadFilename,
    });

    const saveNewUpload = await uploadRepository.save(newUpload);

    console.log("File successfully saved to database:", saveNewUpload);

    res.status(200).json({
      message: "فایل با موفقیت آپلود شد",

      saveNewUpload: {
        path: filePath,
        sizeFile: sizeFile,
        lastModified: saveNewUpload.lastModified,
        id: saveNewUpload.id,
        createdAt: saveNewUpload.createdAt,
      },
      status: 200,
    });
  } catch (error) {
    console.log("createUpload error " + error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
}

async function getAllUploads(req, res) {
  try {
    const uploadRepository = getManager().getRepository(Upload);
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "DESC";

    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [uploads, totalCount] = await uploadRepository.findAndCount({
      skip,
      take: pageSize,
      order: {
        [sortBy]: sortOrder,
      },
    });

    const uploadsData = uploads.map((upload) => {
      const subdirectory = createSubdirectory(upload.createdAt);

      const filePath = upload.path
        ? path.resolve(__dirname, `../uploads/${subdirectory}`, upload.path)
        : null;

      return {
        id: upload.id,
        createdAt: moment(upload.createdAt).format("jYYYY/jMMMM/jDD HH:mm:ss"),
        updatedAt: moment(upload.updatedAt).format("jYYYY/jMMMM/jDD HH:mm:ss"),
        filePath: filePath,
      };
    });

    res.status(200).json({
      uploads: uploadsData,
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

async function removeUploadByPath(req, res) {
  try {
    const uploadPath = req.params.path;

    const uploadRepository = getManager().getRepository(Upload);

    // Find the upload by path
    const upload = await uploadRepository.findOne({
      where: { path: uploadPath },
    });

    // Check if upload is null
    if (!upload) {
      return res.status(404).json({
        message: "فایلی پیدا نشد",
        status: 404,
      });
    }

    // Check if upload has createdAt property before using it
    const subdirectory = createSubdirectory(upload.createdAt || new Date());
    const filePath = path.resolve(
      __dirname,
      `../uploads/${subdirectory}`,
      upload.path
    );

    await fs.promises.unlink(filePath);

    await uploadRepository.remove(upload);

    const user = await userRepository.findOne({
      where: { imageUrl: upload.path },
    });

    if (user) {
      user.imageUrl = null;
      await userRepository.save(user);
    }

    res.status(200).json({
      message: "فایل با موفقیت پاک شد",
      status: 200,
    });
  } catch (error) {
    console.error("Error removing upload by path:", error);
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
        message: "فایلی پیدا نشد",
        status: 404,
      });
    }
    const uploadWithJalaliDates = {
      ...upload,
      createdAt: moment(upload.createdAt).format("jYYYY/jMM/jDD HH:mm:ss"),

      // Add more date fields if necessary
    };

    res.status(200).json({
      //    message: "Upload retrieved successfully",
      upload: uploadWithJalaliDates,
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
}

async function deleteUpload(req, res) {
  try {
    const uploadId = req.params.id;

    const subdirectory = createSubdirectory();
    console.log(`>>> ${subdirectory}`);
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
    const filePath = path.resolve(
      __dirname,
      `../uploads/${subdirectory}`,

      upload.path
    );
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

async function getUploadPath(req, res) {
  try {
    const uploadPath = req.params.path;

    const uploadRepository = getManager().getRepository(Upload);

    const upload = await uploadRepository.findOne({
      where: { path: uploadPath },
    });

    if (!upload) {
      return res.status(404).json({
        message: "فایلی پیدا نشد",
        status: 404,
      });
    }

    // Construct the file path
    const subdirectory = createSubdirectory();
    const filePath = path.resolve(
      __dirname,
      `../uploads/${subdirectory}/${upload.path}`
    );
    console.log(`filePath >>>> ${filePath}`);

    res.status(200).json({
      // message: "File path retrieved successfully",
      id: upload.id,
      createdAt: upload.createdAt,

      filePath: filePath,
      status: 200,
    });
  } catch (error) {
    console.error("Error getting upload path:", error);
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
  getUploadPath,
  updateUpload,
  deleteUpload,
  removeUploadByPath,
};
