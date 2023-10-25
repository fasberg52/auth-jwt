// utils/authUtils.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Kavenegar = require("kavenegar");

function createToken(user) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}

function sendOTPSMS(phone, otp) {
  const OtpApi = Kavenegar.KavenegarApi({
    apikey: process.env.KAVENEGAR_API_KEY,
  });
  OtpApi.VerifyLookup(
    {
      receptor: phone,
      token: otp,
      template: "verifyotp",
    },
    function (response, status) {
      console.log(`message send with status : ${status}`);
    }
  );
}

module.exports = { createToken, sendOTPSMS };
