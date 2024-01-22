const Filter = require("../model/Filter");

const { getRepository } = require("typeorm");
const logger = require("../services/logger");
async function createFilter(req, res) {
  try {
    const { name } = req.body;

    // let parentFilter = null;
    // if (parent.id) {
    //   const parentFilterRepository = getRepository(Filter);
    //   parentFilter = parentFilterRepository.findOne({
    //     where: { id: parent.id },
    //   });
    //   if (!parentFilter) {
    //     return res.status(404).json({ error: "دسته پیدا نشد" });
    //   }
    // }

    const filterRepository = getRepository(Filter);
    const newFilter = filterRepository.create({
      name,
    });

    const result = await filterRepository.save(newFilter); 

    res
      .status(201)
      .json({ message: "با موفقیت ساخته شد", result, status: 201 });
  } catch (error) {
    logger.error(`Error in createFilter >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createFilter };
