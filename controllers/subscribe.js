const { getRepository, MoreThanOrEqual } = require("typeorm");
const webPush = require("web-push");
const Subscribe = require("../model/Subscribe");
const OnlineClass = require("../model/onlineCourse");
const User = require("../model/users");
const cron = require("node-cron");
webPush.setVapidDetails(
  process.env.EMAIL_NOTIFICATION,
  process.env.PUBLIC_KEY_NOTIFICATION,
  process.env.PRIMARY_KEY_NOTIFICATION
);

async function subscribeUser(req, res) {
  try {
    const { subscription } = req.body;
    const userPhone = req.user.phone;
    const userRepository = getRepository(User);
    const exitingUser = await userRepository.findOne({
      where: { phone: userPhone },
    });
    if (!exitingUser) {
      res.status(400).json({ error: "کاربر وجود ندارد", status: 400 });
    }

    const subscribeRepository = getRepository(Subscribe);
    console.log(`>>>>>>>>>> ${JSON.stringify(subscription)}`);
    const existingSubscription = await subscribeRepository.findOne({
      where: { endpoint: subscription.endpoint },
    });
    console.log(
      `existingSubscription >>> ${JSON.stringify(existingSubscription)}`
    );
    if (existingSubscription) {
      return res
        .status(400)
        .json({ message: "سابسکرایب شما از قبل وجود دارد" });
    }

    const newSubscription = subscribeRepository.create({
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      userPhone: userPhone,
    });

    await subscribeRepository.save(newSubscription);

    console.log(newSubscription);
    res.status(201).json({ message: "با موفقیت انجام شد" });
  } catch (error) {
    console.error("Error subscribing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function sendNotif(req, res) {
  try {
    const currentTimestamp = new Date();
    console.log(`currentTimestamp : ${currentTimestamp}`);
    const upcomingClasses = await getRepository(OnlineClass).find({
      where: {
        start: MoreThanOrEqual(currentTimestamp),
      },
    });

    const subscribeRepository = getRepository(Subscribe);

    const subscriptions = await subscribeRepository.find();
    console.log("Subscriptions:", subscriptions);

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return res.status(400).json({ error: "No subscriptions found" });
    }

    for (const onlineClass of upcomingClasses) {
      try {
        const payload = {
          title: "باکلاس آنلاین",
          body: `کلاس ${onlineClass.title} شروع شده است`,
          icon: "https://baclassdevelop.liara.run/app/uploads/2024/02/192.png",
        };

        // Sequentially send notifications for each class to all subscribers
        for (const sub of subscriptions) {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                auth: sub.auth,
                p256dh: sub.p256dh,
              },
            },
            JSON.stringify(payload)
          );
        }

        console.log(`Push notifications sent for class ${onlineClass.title}`);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }

    res.status(200).json({ message: "Push notifications sent successfully" });
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

setInterval(() => {
  const req = {};
  const res = {
    status: (code) => ({
      json: (data) => console.log(data),
    }),
  };

  sendNotif(req, res);
  console.log("time req");
}, 60000);

console.log("time req");
module.exports = { subscribeUser, sendNotif };
