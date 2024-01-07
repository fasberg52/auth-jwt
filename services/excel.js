const ExcelJS = require("exceljs");
const User = require("../model/users");
const { getManager } = require("typeorm");
const logger = require("../services/logger");
async function exportUsersToExcel(req, res) {
  try {
    const month = req.query.month || "01";

    const userRepository = getManager().getRepository(User);

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.phone",
        "user.roles",
        "user.grade",
      ])
      .where(`EXTRACT(MONTH FROM user.createdAt) = :month`, { month })

      .orderBy("user.id", "DESC");

    const users = await queryBuilder.getMany();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.addRow([
      "آیدی",
      "نام",
      "نام خانوادگی",
      "شماره تماس",
      "پایه تحصیلی",
    ]);

    users.forEach((user) => {
      worksheet.addRow([
        user.id,
        user.firstName,
        user.lastName,
        user.phone,
        user.grade,
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    logger.error({ message: "Error in Excel for users", error });
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { exportUsersToExcel };
