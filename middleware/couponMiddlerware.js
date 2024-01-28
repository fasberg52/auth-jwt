// applyCouponMiddleware.js
const { getManager } = require("typeorm");
const Coupon = require("../model/Coupon"); // Adjust the path accordingly

async function applyCouponMiddleware(req, res, next) {
  try {
    const { couponCode } = req.body;
    console.log(couponCode);
    if (couponCode) {
      const couponRepository = getManager().getRepository(Coupon);
      const appliedCoupon = await couponRepository.findOne({
        where: { code: couponCode },
      });

      if (appliedCoupon) {
        req.appliedCoupon = appliedCoupon;
      }
    }

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { applyCouponMiddleware };
