// controllers/upload.js

const { getManager } = require("typeorm");
const { createSubdirectory } = require("../utils/multerUtils"); // Adjust the path accordingly
const fs = require("fs");
const path = require("path");
const Upload = require("../model/Upload");
const moment = require("jalali-moment");
const { exists } = require("fs-extra");

async function createUpload(req, res) {
  try {
    console.log("Received file upload request");
    console.log("req.file : " + JSON.stringify(req.file));

    const sizeFile = req.file.size;
    const originalFilename = req.file.originalname;

    const uploadRepository = getManager().getRepository(Upload);

    let filename = originalFilename;
    let counter = 1;
    while (await uploadRepository.findOne({ where: { path: filename } })) {
      const extension = path.extname(originalFilename);
      const baseName = path.basename(originalFilename, extension);
      filename = `${baseName}-${counter}${extension}`;
      counter++;
    }

    const subdirectory = createSubdirectory();
    const filePath = path.resolve(
      __dirname,
      "../uploads",
      subdirectory,
      filename
    );

    if (!filePath) {
      return res.status(400).json("آپلود شکست خورد");
    }

    // Create a database entry for the uploaded {file
    const existingPath = fs.existsSync(filePath);

    if (!existingPath) {
      throw Error("error file path not exist");
    }
    const newUpload = uploadRepository.create({
      path: filename,
    });

    const saveNewUpload = await uploadRepository.save(newUpload);

    const jalaliCreatedAt = moment(saveNewUpload.createdAt).format(
      "jYYYY/jM/jD HH:mm:ss"
    );

    console.log("File successfully saved to database:", saveNewUpload);

    res.status(200).json({
      message: "فایل با موفقیت آپلود شد",

      saveNewUpload: {
        path: filePath,
        sizeFile: sizeFile,
        lastModified: saveNewUpload.lastModified,
        id: saveNewUpload.id,
        createdAt: jalaliCreatedAt,
      },
      status: 200,
    });
  } catch (error) {
    console.log("createUpload error " + error);
    // If an error occurs, you can handle it appropriately
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
}

// async function getAllUploads(req, res) {
//   try {
//     const uploadRepository = getManager().getRepository(Upload);

//     const page = req.query.page || 1;
//     const pageSize = req.query.pageSize || 10;

//     const skip = (page - 1) * pageSize;

//     const [uploads, totalCount] = await uploadRepository.findAndCount({
//       skip,
//       take: pageSize,
//     });

//     // Convert dates to Jalali format before sending the response
//     const uploadsWithJalaliDates = uploads.map((upload) => {
//       return {
//         ...upload,
//         createdAt: moment(upload.createdAt).format("jYYYY/jMM/jDD HH:mm:ss"),
//         updatedAt: moment(upload.updatedAt).format("jYYYY/jMM/jDD HH:mm:ss"),

//         // Add more date fields if necessary
//       };
//     });

//     res.status(200).json({
//       message: "All uploads retrieved successfully",
//       uploads: uploadsWithJalaliDates,
//       totalCount,
//       status: 200,
//     });
//   } catch (error) {
//     console.error("Error getting all uploads:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       status: 500,
//     });
//   }
// }

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

    // Convert dates to Jalali format and include file paths
    const uploadsData = uploads.map((upload) => {
      const subdirectory = createSubdirectory();

      // Check if upload.path is null before resolving the path
      const filePath = upload.path
        ? path.resolve(__dirname, `../uploads/${subdirectory}`, upload.path)
        : null;

      return {
        id: upload.id,
        createdAt: moment(upload.createdAt).format("jYYYY/jMM/jDD HH:mm:ss"),
        updatedAt: moment(upload.updatedAt).format("jYYYY/jMM/jDD HH:mm:ss"),
        filePath: filePath, // This may be null if upload.path is null
      };
    });

    res.status(200).json({
      //  message: "All uploads retrieved successfully",
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

    if (!upload) {
      return res.status(404).json({
        message: "فایلی پیدا نشد",
        status: 404,
      });
    }

    // Remove the file from the uploads folder
    const subdirectory = createSubdirectory();
    const filePath = path.resolve(
      __dirname,
      `../uploads/${subdirectory}`,
      upload.path
    );

    await fs.unlink(filePath);

    // Remove the record from the database
    await uploadRepository.remove(upload);

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
  // Implement the logic to update an upload by ID
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
