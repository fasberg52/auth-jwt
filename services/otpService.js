//otpService.js
const { generateNumericOTP } = require("../utils/otpUtils");
const { sendOTPSMS } = require("../utils/authUtils");
const { getManager, LessThan } = require("typeorm");
const bcrypt = require("bcryptjs");

const OTP = require("../model/OTP");
const User = require("../model/users");
const OTP_EXPIRATION_TIME_MS = 60 * 1000; // 60 seconds

// async function sendOTP(phone) {
//   let otp; // Define otp variable outside the try block

//   try {
//     const otpRepository = getManager().getRepository(OTP);
//     const existingOTP = await otpRepository.findOne({
//       where: { phone: phone },
//     });

//     if (existingOTP) {
//       // If an OTP record already exists, update the existing record
//       otp = generateNumericOTP(5).toString();
//       console.log(`>>>otp: ${otp}`);
//       sendOTPSMS(phone, otp);

//       // Update the existing OTP record with the new OTP and reset expiration time
//       existingOTP.otp = await bcrypt.hash(otp, 10);
//       existingOTP.expirationTime = new Date(
//         Date.now() + OTP_EXPIRATION_TIME_MS
//       );

//       await otpRepository.save(existingOTP);
//     } else {
//       // If no OTP record exists, create a new one
//       otp = generateNumericOTP(5).toString();
//       console.log(`>>>otp ${phone}: ${otp}`);
//       await sendOTPSMS(phone, otp);

//       const hashedOTP = await bcrypt.hash(otp, 10);
//       const expirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME_MS);
//       const newOTP = otpRepository.create({
//         phone,
//         otp: hashedOTP,
//         expirationTime,
//       });

//       await otpRepository.save(newOTP);
//     }

//     return otp;
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     throw error;
//   }
// }

async function sendOTP(phone) {
  // Define the OTP variable outside the try block for better scoping
  let otp;

  try {
    // Get the OTP repository
    const otpRepository = getManager().getRepository(OTP);

    // Check if an OTP record already exists for the given phone number
    const existingOTP = await otpRepository.findOne({
      where: { phone: phone },
    });

    // Generate a new OTP
    otp = generateNumericOTP(5).toString();
    console.log(`Generated OTP: ${otp}`);

    // Send the OTP via SMS
    await sendOTPSMS(phone, otp);

    if (existingOTP) {
      // If an OTP record exists, update the existing record
      existingOTP.otp = await bcrypt.hash(otp, 10);
      existingOTP.isVerified = false;
      existingOTP.expirationTime = new Date(
        Date.now() + OTP_EXPIRATION_TIME_MS
      );

      // Save the updated record
      await otpRepository.save(existingOTP);
    } else {
      // If no OTP record exists, create a new one
      const hashedOTP = await bcrypt.hash(otp, 10);
      const expirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME_MS);
      const newOTP = otpRepository.create({
        phone,
        otp: hashedOTP,
        expirationTime,
      });

      // Save the new OTP record
      await otpRepository.save(newOTP);
    }

    // Return the generated OTP
    return otp;
  } catch (error) {
    // Handle and log errors
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

    const currentTime = Date.now(); // Current time in milliseconds
    const otpTimestamp = otpRecord.createdAt.getTime(); // Timestamp of OTP record in milliseconds
    const otpExpirationTime = OTP_EXPIRATION_TIME_MS;

    if (currentTime - otpTimestamp > otpExpirationTime) {
      console.log("OTP has expired.");
      otpRecord.expirationTime = new Date(currentTime + otpExpirationTime);
      await otpRepository.save(otpRecord);
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
