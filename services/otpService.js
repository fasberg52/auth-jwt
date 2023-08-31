//otpService.js
const { generateNumericOTP } = require("../utils/otpUtils");
const { sendOTPSMS } = require("../utils/authUtils");
const { getManager } = require("typeorm");
const OTP = require("../model/OTP");

exports.sendOTP = async (phone) => {
  try {
    const otp = generateNumericOTP(6);
    await sendOTPSMS(phone, otp);

    const otpRepository = getManager().getRepository(OTP);
    const newOTP = otpRepository.create({ phone, otp });
    await otpRepository.save(newOTP);

    return otp;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

exports.verifyOTP = async (phone, otp) => {
    try {
      const otpRepository = getManager().getRepository(OTP); // Use the name property
      const existingOTP = await otpRepository.findOne({ where: { phone, otp } });
      return existingOTP !== null;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };
