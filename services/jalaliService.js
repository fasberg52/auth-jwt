const moment = require('jalali-moment');

function convertToJalaliDate(date) {
  if (!date) {
    return null; 
  }

  return moment(date).format('jYYYY/jMM/jDD');
}

module.exports = {
  convertToJalaliDate,
};