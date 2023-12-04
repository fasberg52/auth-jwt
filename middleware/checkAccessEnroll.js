const Enrollment = require("../model/Enrollment");

async function checkAccessEnroll(req, res, next) {
  try {
    const { userPhone, courseId } = req.body;

    const enrollmentRepository = getRepository(Enrollment);

    // Check if the user is already enrolled in the course
    const enrollment = await enrollmentRepository.findOne({
      where: { userPhone, courseId },
    });

    if (enrollment) {
      // User is enrolled, proceed to the next middleware or API
      next();
    } else {
      // User is not enrolled, deny access
      res
        .status(403)
        .json({ error: "Access denied. Please enroll in the course first." });
    }
  } catch (error) {
    logger.error(`Error in checkAccess: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  checkAccessEnroll,
};
