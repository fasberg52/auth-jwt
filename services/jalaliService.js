const moment = require('jalali-moment');

function convertToJalaliDate(date) {
  return moment(date).format('jYYYY/jMM/jDD');
}

module.exports = {
  convertToJalaliDate,
};