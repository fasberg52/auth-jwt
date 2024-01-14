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

module.exports = { applyCoupon, createCoupon };
