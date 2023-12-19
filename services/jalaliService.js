// services/jalaliService

const moment = require("jalali-moment");

function convertToJalaliDate(date) {
  if (!date) {
    return null;
  }

  const jalaliDate = moment(date);
  const persianMonth = jalaliDate.jMonth() + 1; // Adding 1 because Persian months are 1-based

  return {
    jalaliDate: jalaliDate.format("jYYYY/jMMMM/jDD"),
    persianMonth,
  };
}

module.exports = {
  convertToJalaliDate,
};
