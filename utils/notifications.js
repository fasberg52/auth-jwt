// src/utils/sendNotifications.ts
const { getRepository } = require("typeorm");
const onlineClass = require("../model/onlineCourse");
const webpush = require("web-push");


const vapidKeys = {
  publicKey:
    "BE6Gh88dZcOUyOf7OObn6dA62nFJ1wZNAMEw4OQOjFhLG-g9OJR-DLKKh5w6Irxzs1IhPq3U0n68V4o-3soJP4g",
  privateKey: "uFO0-a8RJYYEMzWN4iMbXpK8Rd7nv4ca9O--1szFfOI",
};

webpush.setVapidDetails(
  "mailto:taherian.1993@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function sendNotifications() {
  const classRepository = getRepository(onlineClass);
  const notificationPayload = JSON.stringify({
    title: "باکلاس آنلاین",
    body: "کلاس شما شروع شده است",
  });

  const now = new Date();
  const upcomingClasses = await classRepository
    .createQueryBuilder("onlineClass")
    .where("onlineClass.start > :now", { now })
    .andWhere("onlineClass.start <= :oneMinuteFromNow", {
      oneMinuteFromNow: new Date(now.getTime() + 60 * 1000),
    })
    .getMany();

  for (const upcomingClass of upcomingClasses) {
    for (const subscription of upcomingClass.subscriptions) {
      await webpush.sendNotification(subscription, notificationPayload);
    }
  }
}

module.exports = { sendNotifications };
