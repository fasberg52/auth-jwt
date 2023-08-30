// otpUtils.js
function generateNumericOTP(length) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  module.exports = { generateNumericOTP };