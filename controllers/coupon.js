const Coupon = require("../model/Coupon");
const logger = require("../services/logger");
const { getManager, Like, getRepository } = require("typeorm");
const Order = require("../model/Orders");
async function createCoupon(req, res) {
  try {
    const { code, discountPercentage, expireTime } = req.body;
    const couponRepository = getManager().getRepository(Coupon);
    const exitingCode = await couponRepository.findOne({
      where: { code: code },
    });
    if (exitingCode) {
      return res
        .status(400)
        .json({ error: "کد تخفیف تکراری است", status: 400 });
    }

    const createdAt = new Date();

    if (expireTime) {
      const expireDate = new Date(expireTime);

      if (expireDate <= createdAt) {
        return res
          .status(400)
          .json({ error: "تاریخ انقضا اشتباه است", status: 400 });
      }
    }

    const newCoupon = couponRepository.create({
      code,
      discountPercentage,
      createdAt,
      expireTime,
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

async function getAllCoupons(req, res) {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      query = { where: { code: Like(`%${search}%`) } };
    }

    const couponRepository = getManager().getRepository(Coupon);
    const [coupons, totalCount] = await couponRepository.findAndCount(query);

    res.json({ coupons, totalCount, status: 200 });
  } catch (error) {
    logger.error(`error in getAllCoupons ${error}`);
    res.status(500).json("Internal Server Error");
  }
}

async function editCoupon(req, res) {
  try {
    const { couponId } = req.params;
    const { code, discountPercentage, expireTime } = req.body;

    const couponRepository = getManager().getRepository(Coupon);
    const existingCoupon = await couponRepository.findOne({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return res.status(404).json({ error: "کد تخفیف وجود ندارد!" });
    }

    existingCoupon.code = code || existingCoupon.code;
    existingCoupon.discountPercentage =
      discountPercentage || existingCoupon.discountPercentage;
    existingCoupon.expireTime = expireTime || existingCoupon.expireTime;

    await couponRepository.save(existingCoupon);

    res.status(200).json({
      message: "کد تخفیف ویرایش شد",
      updatedCoupon: existingCoupon,
      status: 200,
    });
  } catch (error) {
    logger.error(`Error in editCoupon ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteCoupon(req, res) {
  try {
    const { couponId } = req.params;

    const couponRepository = getManager().getRepository(Coupon);
    const existingCoupon = await couponRepository.findOne({
      where: { id: couponId },
    });

    if (!existingCoupon) {
      return res
        .status(404)
        .json({ error: "کد تخفیف وجود ندارد!", status: 404 });
    }

    await couponRepository.remove(existingCoupon);

    res.status(200).json({ message: "کد تخفیف حذف شد", status: 200 });
  } catch (error) {
    logger.error(`Error in deleteCoupon ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function applyCoupon(req, res) {
  try {
    const { coupon, orderId } = req.body;

    if (!coupon || !orderId) {
      return res
        .status(400)
        .json({ error: "کد تخفیف و شناسه سفارش را وارد کنید", status: 400 });
    }

    const couponRepository = getManager().getRepository(Coupon);
    const appliedCoupon = await couponRepository.findOne({
      where: { code: coupon },
    });

    if (!appliedCoupon) {
      return res
        .status(404)
        .json({ error: "کد تخفیف وجود ندارد", status: 404 });
    }

    const orderRepository = getRepository(Order);
    const existingOrder = await orderRepository.findOneBy({ id: orderId });

    if (!existingOrder) {
      return res
        .status(404)
        .json({ error: "سفارش با شناسه داده شده یافت نشد", status: 404 });
    }

    existingOrder.couponId = appliedCoupon.id;
    existingOrder.discountTotalPrice = calculateDiscountedTotalPrice(
      existingOrder.originalTotalPrice,
      appliedCoupon.discountPercentage
    );

    const updatedOrder = await orderRepository.save(existingOrder);

    req.session.appliedCoupon = {
      coupon: appliedCoupon,
      orderId: orderId,
    };

    console.log(req.session.appliedCoupon);

    return res
      .status(200)
      .json({ message: "کد تخفیف با موفقیت اعمال شد", status: 200 });
  } catch (error) {
    console.error(`Error in applyCoupon: ${error}`);
    res.status(500).json("Internal Server Error");
  }
}

function calculateDiscountedTotalPrice(originalTotalPrice, discountPercentage) {
  if (!isNaN(discountPercentage)) {
    const discountAmount = (discountPercentage / 100) * originalTotalPrice;
    return discountAmount;
  } else {
    console.error(`Invalid discount percentage: ${discountPercentage}`);
    return originalTotalPrice;
  }
}

async function deleteAppliedCoupon(req, res) {
  try {
    const userPhone = req.user.phone;
    const orderId = req.params.orderId;
    const orderRepository = getRepository(Order);
    const existingOrder = await orderRepository.findOne({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "این سفارش وجود ندارد" });
    }

    existingOrder.couponId = null;
    existingOrder.discountTotalPrice = null;

    await orderRepository.save(existingOrder);

    delete req.session.appliedCoupon;

    return res.status(200).json({
      message: "کد تخفیف با موفقیت حذف شد",
      user: userPhone,
      orderId,
      status: 200,
    });
  } catch (error) {
    console.error(`Error in deleteAppliedCoupon: ${error}`);
    res.status(500).json("Internal Server Error");
  }
}

module.exports = {
  deleteAppliedCoupon,
  applyCoupon,
  createCoupon,
  getByIdCoupon,
  getAllCoupons,
  editCoupon,
  deleteCoupon,
};
