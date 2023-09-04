//otpService.js
const { generateNumericOTP } = require("../utils/otpUtils");
const { sendOTPSMS } = require("../utils/authUtils");
const { getManager } = require("typeorm");
const bcrypt = require("bcryptjs");

const OTP = require("../model/OTP");
const User = require("../model/users");
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
    const otpRepository = getManager().getRepository(OTP);

    // Retrieve the OTP record from the database
    const otpRecord = await otpRepository.findOne({ where: { phone } });

    if (!otpRecord) {
      return false; // No record found for the phone
    }

    // Check if the OTP has expired
    if (!otpRecord || otpRecord.isVerified) {
      return false; // Invalid OTP
    }
    if (otp === otpRecord.otp) {
      otpRecord.isVerified = true;
      await otpRepository.save(otpRecord);
      return true; // Valid OTP
    }

    return false; //invalid otp
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};
// exports.verifyOTP = async (phone, otp) => {
//   try {
//     const otpRepository = getManager().getRepository(OTP); // Use the name property
//     console.log("Verifying OTP for phone:", phone, "and otp:", otp);

//     const existingOTP = await otpRepository.findOne({ where: { phone, otp } });
//     console.log("Existing OTP record:", existingOTP);

//     return existingOTP !== null;
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     throw error;
//   }
// };
