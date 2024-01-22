const Filter = require("../model/Filter");

const { getRepository } = require("typeorm");
const logger = require("../services/logger");
const { filter } = require("compression");
async function createFilter(req, res) {
  try {
    const { name, children } = req.body;

    const filterRepository = getRepository(Filter);

    let parentFilter = null;

    if (name) {
      parentFilter = filterRepository.create({
        name,
      });

      await filterRepository.save(parentFilter);
    }

    if (children && children.length > 0) {
      const childFilters = children.map((child) =>
        filterRepository.create({
          name: child.name,
          parent: parentFilter,
        })
      );

      await filterRepository.save(childFilters);
    }

    res.status(201).json({
      message: "با موفقیت ساخته شد",
      status: 201,
    });
  } catch (error) {
    logger.error(`Error in createFilter >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editFilter(req, res) {
  try {
    const { id, name, children } = req.body;

    const filterRepository = getRepository(Filter);

    const existingFilter = await filterRepository.findOne({
      where: { id },
      relations: ["children"],
    });

    if (!existingFilter) {
      return res.status(404).json({ error: "فیلتر وجود ندارد" });
    }

    existingFilter.name = name;

    if (children && children.length > 0) {
      const updatedChildren = [];

      for (const child of children) {
        const existingChild = existingFilter.children.find(
          (c) => c.id === child.id
        );

        if (existingChild) {
          existingChild.name = child.name;
          await filterRepository.save(existingChild);
          updatedChildren.push(existingChild);
        } else {
          const newChild = filterRepository.create({
            name: child.name,
            parent: existingFilter,
          });
          existingFilter.children.push(newChild);
          await filterRepository.save(newChild);
          updatedChildren.push(newChild);
        }
      }

      existingFilter.children.forEach(async (child) => {
        if (
          !updatedChildren.find((updatedChild) => updatedChild.id === child.id)
        ) {
          await filterRepository.remove(child);
        }
      });

      existingFilter.children = updatedChildren;
    } else {
      existingFilter.children.forEach(async (child) => {
        await filterRepository.remove(child);
      });
      existingFilter.children = [];
    }

    const updatedFilter = await filterRepository.save(existingFilter);
    res.status(200).json({
      message: "با موفقیت ویرایش شد",
      updatedFilter,
      status: 200,
    });
  } catch (error) {
    logger.error(`Error in editFilter >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllFilters(req, res) {
  try {
    const filterRepository = getRepository(Filter);

    const filtersWithHierarchy = await filterRepository
      .createQueryBuilder("filter")
      .leftJoin("filter.children", "children")
      .select(["filter.id", "filter.name", "children.id", "children.name"])
      .where("filter.parent IS NULL")
      .getMany();

    res.status(200).json({ filters: filtersWithHierarchy });
  } catch (error) {
    logger.error(`Error in getAllFilters >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteFilter(req, res) {
  try {
    const { filterId } = req.params;

    const filterRepository = getRepository(Filter);

    const filterToDelete = await filterRepository.findOne({
      where: { id: filterId },
      relations: ["children"],
    });

    if (!filterToDelete) {
      return res.status(404).json({ error: "فیلتر وجود ندارد" });
    }

    if (filterToDelete.children && filterToDelete.children.length > 0) {
      await Promise.all(
        filterToDelete.children.map(async (child) => {
          await filterRepository.remove(child);
        })
      );
    }

    await filterRepository.remove(filterToDelete);

    res.status(200).json({
      message: "با موفقیت حذف شد",
      status: 200,
    });
  } catch (error) {
    logger.error(`Error in deleteFilter >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createFilter, getAllFilters, editFilter, deleteFilter };
