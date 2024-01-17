const Coupon = require("../model/Coupon");
const logger = require("../services/logger");
const { getManager } = require("typeorm");

async function createCoupon(req, res) {
  try {
    const { code, discountPersentage } = req.body;
    const couponRepository = getManager().getRepository(Coupon);

    const newCoupon = couponRepository.create({
      code,
      discountPersentage,
    });
    await couponRepository.save(newCoupon);
    res.status(201).json({ message: "کوپن ساخته شد", newCoupon, status: 201 });
  } catch (error) {
    logger.error(`Error in CreateCoupon ${error}`);
    res.status(500).json("Internal Server Error");
  }
}

async function getByIdCoupon(req, res) {
  try {
    const { couponId } = req.params;

    const couponRepository = getManager().getRepository(Coupon);
    const existingCoupon = await couponRepository.findOne({
      where: { id: couponId },
    });
    if (!existingCoupon) {
      return res.status(404).json({ error: "کد تخفیف وجود ندارد!" });
    }

    res.status(200).json(existingCoupon);
  } catch (error) {
    logger.error(`Error in ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllCoupons(req, res) {}

async function editCoupon(req, res) {}

async function deleteCoupon(req, res) {}

async function applyCoupon(req, res) {
  const { coupon } = req.body;

  if (!coupon) {
    res.status(400).json({ error: "کد وجود ندارد" });
  }

  const couponRepository = getManager().getRepository(Coupon);
  const appliedCoupon = await couponRepository.findOne({
    where: { code: coupon },
  });

  if (!appliedCoupon) {
    return res.status(404).json({ error: "کد تخفیف وجود ندارد" });
  }
}

module.exports = { applyCoupon, createCoupon, getByIdCoupon };
