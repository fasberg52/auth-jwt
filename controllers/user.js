const User = require("../model/users");
const UserPartStatus = require("../model/UserPart");
const Upload = require("../model/Upload");
const Subscribe = require("../model/Subscribe");
const OTP = require("../model/OTP");
const Part = require("../model/Part");
const { createSubdirectory } = require("../utils/multerUtils");
const fs = require("fs");
const path = require("path");
const { getManager, getRepository } = require("typeorm");
const logger = require("../services/logger");

const { verifyAndDecodeToken } = require("../utils/jwtUtils");
const { subscribe } = require("diagnostics_channel");

async function getUserDataWithToken(req, res) {
  try {
    const phone = req.user.phone;

    const userRepository = getRepository(User);
    const subscribeRepository = getRepository(Subscribe);
    const existingUser = await userRepository.findOne({
      where: { phone: phone },
    });

    if (existingUser) {
      const user = {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        phone: existingUser.phone,
        role: existingUser.roles,
        imageUrl: existingUser.imageUrl,
        grade: existingUser.grade,
        skuTest: existingUser.skuTest,
        createdAt: new Date(existingUser.createdAt).getTime(),
        updatedAt: existingUser.updatedAt
          ? new Date(existingUser.updatedAt).getTime()
          : null,
        lastLogin: existingUser.lastLogin
          ? new Date(existingUser.lastLogin).getTime()
          : null,
      };

      const existingSubscription = await subscribeRepository.findOne({
        where: { userPhone: phone },
      });

      if (existingSubscription) {
        user.isActive = existingSubscription.isActive;
      }

      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "کاربری با این شماره پیدا نشد" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllOrderUser(req, res) {
  try {
    const userRepository = getRepository(User);

    const phone = req.user.phone;

    const user = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.orders", "orders")
      .where("user.phone = :phone", { phone })
      .getOne();

    if (!user) {
      return res.status(404).json({ error: "کاربری پیدا نشد" });
    }

    return res.status(200).json({ orders: user.orders, status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editDataUser(req, res) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "توکن وجود ندارد" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = verifyAndDecodeToken(token);

    if (!decodedToken || !decodedToken.phone) {
      return res.status(401).json({ error: "توکن اشتباه است" });
    }

    const phone = decodedToken.phone;
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({ error: "کاربری پیدا نشد" });
    }

    if (req.body.firstName) {
      user.firstName = req.body.firstName;
    }

    if (req.body.lastName) {
      user.lastName = req.body.lastName;
    }
    if (req.body.imageUrl) {
      user.imageUrl = req.body.imageUrl;
    }

    if (req.body.grade) {
      user.grade = req.body.grade;
    }
    user.updatedAt = new Date();
    delete user.password;
    await userRepository.save(user);

    res.status(200).json({ message: "با موفقیت بروز شد", user, status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function logoutPanel(req, res) {
  try {
    const phone = req.params.phone;

    const otpRepository = getRepository(OTP);
    const existingOTP = await otpRepository.findOne({
      where: { phone: phone },
    });

    if (!existingOTP) {
      return res.status(404).json({ error: "کاربری پیدا نشد" });
    }

    await otpRepository.remove(existingOTP);

    return res
      .status(200)
      .json({ message: "کاربر با موفقیت خارج شد", status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createProfilePictureUpload(req, res) {
  try {
    const sizeFile = req.file.size;

    const originalFilename = req.file.originalname;

    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "توکن وجود ندارد" });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = verifyAndDecodeToken(token);

    if (!decodedToken || !decodedToken.phone) {
      return res.status(401).json({ error: "توکن اشتباه است" });
    }

    const phone = decodedToken.phone;

    const userRepository = getRepository(User);

    const user = await userRepository.findOne({ where: { phone: phone } });

    if (!user) {
      return res.status(404).json({
        message: "کاربری پیدا نشد",
        status: 404,
      });
    }

    const subdirectory = createSubdirectory(new Date());

    const filePath = path.resolve(
      __dirname,
      "../uploads",
      subdirectory,
      originalFilename
    );
    const uploadRepository = getRepository(Upload);

    const newUpload = uploadRepository.create({
      path: req.uploadFilename,
    });

    const saveNewUpload = await uploadRepository.save(newUpload);
    user.imageUrl = filePath;
    await userRepository.save(user);
    console.log("File successfully saved to database:", saveNewUpload);

    res.status(201).json({
      message: "عکس پروفایل با موفقیت آپلود شد",

      saveNewUpload: {
        //  path: filePath,
        sizeFile: sizeFile,
        lastModified: saveNewUpload.lastModified,
        id: saveNewUpload.id,
        createdAt: saveNewUpload.createdAt,
        imageUrl: user.imageUrl,
      },
      status: 201,
    });
  } catch (error) {
    console.error("createProfilePictureUpload error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
}

async function readPartsUserId(req, res) {
  try {
    const { phone, partId, isRead, courseId } = req.body;

    const parsedPartId = parseInt(partId);
    const parsedCourseId = parseInt(courseId);

    const userPartStatusRepository = getRepository(UserPartStatus);
    let userPartStatus = await userPartStatusRepository.findOneBy({
      phone: phone,
      partId: parsedPartId,
    });

    if (!userPartStatus) {
      userPartStatus = userPartStatusRepository.create({
        phone,
        partId: parsedPartId,
        isRead,
        courseId: parsedCourseId,
      });
    } else {
      userPartStatus.isRead = isRead;
    }

    await userPartStatusRepository.save(userPartStatus);

    return res.status(200).json({ message: "خوانده شد", status: 200 });
  } catch (error) {
    console.error("Error in updating read status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function unReadPartsUserId(req, res) {
  try {
    const { phone, partId } = req.body;

    const userPartStatusRepository = getRepository(UserPartStatus);
    let userPartStatus = await userPartStatusRepository.findOne({
      where: { phone, partId },
    });

    if (userPartStatus) {
      userPartStatus.isRead = false;
      await userPartStatusRepository.save(userPartStatus);
      res.status(200).json({ message: "!خوانده نشد", status: 200 });
    } else {
      res.status(404).json({ error: "وضعیت پیدا نشد", status: 404 });
    }
  } catch (error) {
    console.error("Error in marking part as unread:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateTeachingMethodRating(req, res) {
  const { phone, partId, courseId, teachingRating } = req.body;
  const entityManager = getManager();

  try {
    await entityManager.transaction(async (transactionalEntityManager) => {
      const userPartRepository =
        transactionalEntityManager.getRepository(UserPartStatus);

      const userPart = await userPartRepository.findOne({
        where: { phone, partId, courseId },
      });

      if (!userPart) {
        userPart = new UserPartStatus();
        userPart.phone = phone;
        userPart.partId = partId;
        userPart.courseId = courseId;
      }

      userPart.teachingRating = teachingRating;

      await userPartRepository.save(userPart);
    });

    return res.status(200).json({ message: "ممنون از رای شما", status: 200 });
  } catch (error) {
    console.error("Error updating teaching method rating:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getReadPartId(req, res) {
  try {
    const phone = req.user.phone;
    const { partId, courseId } = req.params;
    const parsedPartId = parseInt(partId);
    const parsedCourseId = parseInt(courseId);

    const userPartStatusRepository = getRepository(UserPartStatus);
    const userPartStatus = await userPartStatusRepository.findOneBy({
      phone: phone,
      partId: parsedPartId,
      courseId: parsedCourseId,
    });

    if (!userPartStatus) {
      return res.status(200).json({ isRead: false, status: 200 });
    }
    const isRead = userPartStatus.isRead;
    return res.status(200).json({ isRead, status: 200 });
  } catch (error) {
    console.error("Error getAllreadPartsUserId:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
// async function countIsRead(req, res) {
//   try {
//     const { courseId } = req.params;
//     const phone = req.user;
//     const parsedCourseId = parseInt(courseId);
//     const userPartRepository = getRepository(UserPartStatus);

//     const totalTrueResult = await userPartRepository
//       .createQueryBuilder("UserPart")
//       .select("COUNT(UserPart.isRead)", "totalTrue")
//       .where("UserPart.courseId = :courseId", { courseId: parsedCourseId })
//       .andWhere("UserPart.phone = :phone", { phone: phone })
//       .andWhere("UserPart.isRead = :isRead", { isRead: true })
//       .getRawOne();

//     if (!totalTrueResult || !totalTrueResult.totalTrue) {
//       return res.status(404).json({ error: "اطلاعاتی یافت نشد" });
//     }

//     const totalTrue = parseInt(totalTrueResult.totalTrue);

//     const totalParts = await userPartRepository.count({
//       courseId: parsedCourseId,
//       phone: phone,
//     });

//     return res.json({ totalTrue, totalParts });
//   } catch (error) {
//     console.error("Error countIsRead:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

async function countIsRead(req, res) {
  try {
    const { courseId } = req.params;
    const phone = req.user.phone;
    const parsedCourseId = parseInt(courseId);


    const totalTrue = await getRepository(UserPartStatus).count({
      where: { isRead: true, phone: phone },
    });

    const totalParts = await getRepository(Part).count({
      where: { courseId: parsedCourseId },
    });

    return res.json({ totalTrue, totalParts });
  } catch (error) {
    console.error("Error countIsRead:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getUserDataWithToken,
  getAllOrderUser,
  editDataUser,
  logoutPanel,
  createProfilePictureUpload,
  readPartsUserId,
  unReadPartsUserId,
  updateTeachingMethodRating,
  getReadPartId,
  countIsRead,
};
