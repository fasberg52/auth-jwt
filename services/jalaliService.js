// services/jalaliService

const moment = require('jalali-moment');

function convertToJalaliDate(date) {
  if (!date) {
    return null;
  }


  moment.locale('fa');

  const persianMonthName = moment(date).format('MMMM');

  return moment(date).format(`jDD/${persianMonthName}/jYYYY`);
}

module.exports = {
  convertToJalaliDate,
};
