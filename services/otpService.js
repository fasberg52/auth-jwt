//otpService.js
const { generateNumericOTP } = require("../utils/otpUtils");
const { sendOTPSMS } = require("../utils/authUtils");
const { getManager, LessThan } = require("typeorm");
const bcrypt = require("bcryptjs");

const OTP = require("../model/OTP");
const User = require("../model/users");
const OTP_EXPIRATION_TIME_MS = 60 * 1000; // 60 seconds

async function sendOTP(phone) {
  let otp;

  try {
    const otpRepository = getManager().getRepository(OTP);

    const existingOTP = await otpRepository.findOne({
      where: { phone: phone },
    });

    otp = generateNumericOTP(5).toString();
    console.log(`Generated OTP: ${otp}`);


    await sendOTPSMS(phone, otp);

    if (existingOTP) {
      existingOTP.otp = await bcrypt.hash(otp, 10);
      existingOTP.isVerified = false;
      existingOTP.createdAt = new Date();
      existingOTP.expirationTime = new Date(
        Date.now() + OTP_EXPIRATION_TIME_MS
      );

      await otpRepository.save(existingOTP);
    } else {
      const hashedOTP = await bcrypt.hash(otp, 10);
      const expirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME_MS);
      const newOTP = otpRepository.create({
        phone,
        otp: hashedOTP,
        expirationTime,
        createdAt: new Date(),
      });

      await otpRepository.save(newOTP);
    }

    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

async function verifyOTP(phone, otp) {
  try {
    const otpRepository = getManager().getRepository(OTP);

    const otpRecord = await otpRepository.findOne({ where: { phone: phone } });

    if (!otpRecord) {
      console.log("No OTP record found for the phone.");
      return false;
    }

    const currentTime = Date.now(); 
    const otpTimestamp = otpRecord.createdAt.getTime(); 
    const otpExpirationTime = OTP_EXPIRATION_TIME_MS;

    if (currentTime - otpTimestamp > otpExpirationTime) {
      console.log("OTP has expired.");
      //otpRecord.expirationTime = new Date(currentTime + otpExpirationTime);
      //await otpRepository.save(otpRecord);
      res.status(401).json({ error: "زمان رمز یکبار مصرف منقضی شده است" });
      //return false;
    }

    const isValidOTP = await bcrypt.compare(otp, otpRecord.otp);
    console.log(`isVALIDOTP VERIFY : ${isValidOTP}`);
    if (isValidOTP) {
      // Use a query builder to update isVerified to true without deleting the record
      await otpRepository
        .createQueryBuilder()
        .update(OTP)
        .set({ isVerified: true })
        .where("phone = :phone", { phone: phone })
        .execute();
    }

    return isValidOTP;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

module.exports = {
  verifyOTP,
  sendOTP,
};
