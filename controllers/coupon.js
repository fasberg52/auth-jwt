const Coupon = require("../model/Coupon");
const { getManager } = require("typeorm");
async function applyCoupon(req, res) {
  const { coupon } = req.body;

  if (!coupon) {
    res.status(400).json({ error: "کد وجود ندارد" });
  }

  const couponRepository = getManager().getRepository(Coupon);
  const appliedCoupon  = await couponRepository.findOne({
    where: { name: coupon },
  });
}

module.exports = { applyCoupon };
