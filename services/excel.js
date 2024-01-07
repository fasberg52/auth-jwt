const ExcelJS = require('exceljs');

async function exportUsersToExcel(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);

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
      .orderBy("user.id", "DESC");

    const users = await queryBuilder.getMany();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Add headers
    worksheet.addRow(['ID', 'First Name', 'Last Name', 'Phone', 'Roles', 'Grade']);

    // Add data
    users.forEach(user => {
      worksheet.addRow([
        user.id,
        user.firstName,
        user.lastName,
        user.phone,
        user.roles,
        user.grade,
      ]);
    });

    // Set content type and disposition for the response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while exporting users to Excel." });
  }
}


