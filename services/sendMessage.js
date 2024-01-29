// services/sendMessage.js
const moment = require("moment");
const Kavenegar = require("kavenegar");

const kavenegarApi = Kavenegar.KavenegarApi({
  apiKey: process.env.KAVENEGAR_API_KEY,
});

function sendNotification(userPhone, className, classStartTime) {
  try {
    const currentTime = moment();
    const classTime = moment(classStartTime);

    // Check if the class is still upcoming
    if (classTime.isAfter(currentTime)) {
      const timeDifference = classTime.diff(currentTime);

      // Check if the class is within the next 15 minutes
      if (timeDifference <= 15 * 60 * 1000) {
        const message = `Class "${className}" starts at ${classTime.format(
          "YYYY-MM-DD HH:mm"
        )}`;
        kavenegarApi.Send({
          message,
          receptor: userPhone,
        });
        console.log(
          `Notification sent to ${userPhone} for the class "${className}" starting at ${classTime.format(
            "YYYY-MM-DD HH:mm"
          )}`
        );
      }
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// function scheduleNotifications(enrolledCourses) {
//   enrolledCourses.forEach((enrollment) => {
//     const { userPhone, title, startDate } = enrollment;
//     const notificationTime = moment(startDate).subtract(15, "minutes");

//     // Check if the class time is not over
//     if (moment(startDate).isAfter(moment())) {
//       setTimeout(() => {
//         sendNotification(userPhone, title, startDate);
//       }, notificationTime.diff(moment()));
//     }
//   });
// }


module.exports = { sendNotification };
