const { getRepository } = require("typeorm");
const webPush = require("web-push");
const Subscribe = require("../model/Subscribe");
webPush.setVapidDetails(
  process.env.EMAIL_NOTIFICATION,
  process.env.PUBLIC_KEY_NOTIFICATION,
  process.env.PRIMARY_KEY_NOTIFICATION
);

async function subscribeUser(req, res) {
  try {
    const { subscription } = req.body;
    const subscribeRepository = getRepository(Subscribe);

    const existingSubscription = await subscribeRepository.findOne({
      where: { endpoint: subscription.endpoint },
    });
    console.log(existingSubscription);
    if (existingSubscription) {
      return res
        .status(400)
        .json({ message: "سابسکرایب شما از قبل وجود دارد" });
    }

    const newSubscription = subscribeRepository.create({
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
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
    const subscribeRepository = getRepository(Subscribe);

    const subscriptions = await subscribeRepository.find();

    console.log(subscriptions);

    const notificationPayload = {
      title: "باکلاس آنلاین",
      body: "کلاس شما شروع شده است",
    };

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(400).json({ error: "No subscriptions found" });
    }

    await Promise.all(
      subscriptions.map((sub) =>
        webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          },
          JSON.stringify(notificationPayload)
        )
      )
    );

    console.log(subscriptions);
    res.status(200).json({ message: "Push notifications sent successfully" });
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { sendNotif };

module.exports = { subscribeUser, sendNotif };
