// services/sendMessage.js

const moment = require("moment");
const Kavenegar = require("kavenegar");

const kavenegarApi = Kavenegar.KavenegarApi({
  apiKey: process.env.KAVENEGAR_API_KEY,
});

function sendNotification(userPhone, className, classStartTime) {
  try {
    const message = `Class "${className}" starts at ${moment(
      classStartTime
    ).format("YYYY-MM-DD HH:mm")}`;
    kavenegarApi.Send({
      message,
      receptor: userPhone,
    });
    console.log(
      `Notification sent to ${userPhone} for the class "${className}" starting at ${moment(
        classStartTime
      ).format("YYYY-MM-DD HH:mm")}`
    );
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

function scheduleNotifications(enrolledCourses) {
  enrolledCourses.forEach((enrollment) => {
    const { userPhone, title, startDate } = enrollment;
    const notificationTime = moment(startDate).subtract(15, "minutes");

    setTimeout(() => {
      sendNotification(userPhone, title, startDate);
    }, notificationTime.diff(moment()));
  });
}

module.exports = { sendNotification, scheduleNotifications };
