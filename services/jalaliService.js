const moment = require('jalali-moment');

function convertToJalaliDate(date) {
  if (!date) {
    return null; // or any other default value or message you want to use for null dates
  }

  return moment(date).format('jYYYY/jMM/jDD');
}

module.exports = {
  convertToJalaliDate,
};