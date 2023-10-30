//otpService.js
const { generateNumericOTP } = require("../utils/otpUtils");
const { sendOTPSMS } = require("../utils/authUtils");
const { getManager, LessThan } = require("typeorm");
const bcrypt = require("bcryptjs");

const OTP = require("../model/OTP");
const User = require("../model/users");
const OTP_EXPIRATION_TIME_MS = 60 * 1000; // 60 seconds

// async function sendOTP(phone) {
//    try {
//   //   const userRepository = getManager().getRepository(User); // Assuming User is the correct entity name
//   //   const existingUser = await userRepository.findOne({ where: { phone } });

//   //   if (!existingUser) {
//   //     console.error(`User with phone number ${phone} does not exist.`);
//   //     return;
//   //   }
//     const otp = generateNumericOTP(5).toString();
//     console.log(`>>>otp: ${otp}`);
//     await sendOTPSMS(phone, otp);

//     const otpRepository = getManager().getRepository(OTP);
//     const hashedPassword = await bcrypt.hash(otp, 10);

//     const expirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME_MS);
//     const newOTP = otpRepository.create({
//       phone,
//       otp: hashedPassword,
//       expirationTime,
//     });
//     await otpRepository.save(newOTP);
//     await otpRepository.delete({ expirationTime: LessThan(new Date()) });

//     return otp;
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     throw error;
//   }
// }

async function sendOTP(phone) {
  let otp; // Define otp variable outside the try block

  try {
    const otpRepository = getManager().getRepository(OTP);
    const existingOTP = await otpRepository.findOne({
      where: { phone: phone },
    });

    if (existingOTP) {
      // If an OTP record already exists, update the existing record
      otp = generateNumericOTP(5).toString();
      console.log(`>>>otp: ${otp}`);
      await sendOTPSMS(phone, otp);

      // Update the existing OTP record with the new OTP and reset expiration time
      existingOTP.otp = await bcrypt.hash(otp, 10);
      existingOTP.expirationTime = new Date(
        Date.now() + OTP_EXPIRATION_TIME_MS
      );

      await otpRepository.save(existingOTP);
    } else {
      // If no OTP record exists, create a new one
      otp = generateNumericOTP(5).toString();
      console.log(`>>>otp ${phone}: ${otp}`);
      await sendOTPSMS(phone, otp);

      const hashedOTP = await bcrypt.hash(otp, 10);
      const expirationTime = new Date(Date.now() + OTP_EXPIRATION_TIME_MS);
      const newOTP = otpRepository.create({
        phone,
        otp: hashedOTP,
        expirationTime,
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

    const currentTime = Date.now(); // Current time in milliseconds
    const otpTimestamp = otpRecord.createdAt.getTime(); // Timestamp of OTP record in milliseconds
    const otpExpirationTime = OTP_EXPIRATION_TIME_MS;

    if (currentTime - otpTimestamp > otpExpirationTime) {
      console.log("OTP has expired. Removing record.");
      await otpRepository.remove(otpRecord);
      return false;
    }

    const isValidOTP = await bcrypt.compare(otp, otpRecord.otp);
    console.log(`isVALIDOTP VERIFY : ${isValidOTP}`);
    if (isValidOTP) {
      otpRecord.isVerified = true; // Mark the OTP as verified for the current verification
      await otpRepository.save(otpRecord); // Update the OTP record

      // Remove the OTP record from the database to prevent further use
      await otpRepository.remove(otpRecord);
    }

    return isValidOTP;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

<<<<<<< HEAD
=======
async function isOTPExpired(phone) {
  try {
    const otpRepository = getManager().getRepository(OTP);
    const otpRecord = await otpRepository.findOne({ where: { phone: phone } });

    if (!otpRecord) {
      // No OTP record found, consider it as expired
      return true;
    }

    const currentTime = new Date();
    const otpTimestamp = otpRecord.createdAt;
    const otpExpirationTime = OTP_EXPIRATION_TIME_MS;

    return currentTime - otpTimestamp > otpExpirationTime;
  } catch (error) {
    console.error("Error checking OTP expiration:", error);
    return false; // Assume OTP is not expired in case of an error
  }
}
>>>>>>> 97b9e70fef3fefdc93a9cfba3e7661539999b0dc
// async function verifyOTP(phone, otp) {
//   try {
//     const otpRepository = getManager().getRepository(OTP);

//     const otpRecord = await otpRepository.findOne({ where: { phone: phone } });
//     console.log("OTP record:", otpRecord);
//     if (!otpRecord) {
//       console.log(!otpRecord);
//       return false;
//     }

//     const currentTime = new Date();
//     const otpTimestamp = otpRecord.createdAt;
//     const otpExpirationTime = process.env.TIMER_SEND_OTP * 1000; // 30 seconds in milliseconds

//     if (currentTime - otpTimestamp > otpExpirationTime) {

//       await otpRepository.remove(otpRecord);
//       return false;
//     }

//     const isValidOTP = await bcrypt.compare(otp, otpRecord.otp);

//     if (isValidOTP) {

//       otpRecord.isVerified = true;
//       await otpRepository.save(otpRecord);
//     }

//     return isValidOTP;
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     throw error;
//   }
// }

module.exports = {
  verifyOTP,
  sendOTP,
  isOTPExpired
};

// exports.verifyOTP = async (phone, otp) => {
//   try {
//     const otpRepository = getManager().getRepository(OTP);

//     // Retrieve the OTP record from the database
//     console.log(phone);

//     const otpRecord = await otpRepository.findOne({ where: { phone: phone } });
//     console.log("OTP record:", otpRecord);
//     if (!otpRecord) {
//       return false; // No record found for the phone
//     }
//     // Check if the OTP has expired

//     const isValidOTPp = await bcrypt.compare(otp, otpRecord.otp);
//     if (isValidOTPp) {
//       // Mark the OTP as verified (optional)
//       otpRecord.isVerified = true;
//       await otpRepository.save(otpRecord);
//     }
//     console.log(`>>>isValidOTPp: ${isValidOTPp}`);
//     return isValidOTPp; //invalid otp
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     throw error;
//   }
// };
