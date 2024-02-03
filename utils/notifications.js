// src/utils/sendNotifications.ts
const { getRepository } = require("typeorm");
const onlineClass = require("../model/onlineCourse");
const webpush = require("web-push");

// Configure web-push with your VAPID keys
const vapidKeys = {
  publicKey:
    "BGAOyAddltajvTJv80p9N3r7rRR1IDZZkVq-F5RORBkHhCr6LGR0hBTyeXSbOhJjVF4qOxFm_Gq6DwXol0sKZ1s",
  privateKey: "Oh1ceRS4oVJt4fHs-ksdW3PYhsnLRGxDRC4uYInAU_I",
};

webpush.setVapidDetails(
  "mailto:taherian.1993@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

async function sendNotifications() {
  const classRepository = getRepository(onlineClass);
  const notificationPayload = JSON.stringify({
    title: "Class Reminder",
    body: "Your class is starting soon.",
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
