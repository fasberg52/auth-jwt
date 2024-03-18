const { getRepository, MoreThanOrEqual } = require("typeorm");
const webPush = require("web-push");
const Subscribe = require("../model/Subscribe");
const OnlineClass = require("../model/onlineCourse");
const User = require("../model/users");
const cron = require("cron");
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
    const subscribeRepository = getRepository(Subscribe);

    const existingUser = await userRepository.findOne({
      where: { phone: userPhone },
    });

    if (!existingUser) {
      res.status(400).json({ error: "کاربر وجود ندارد", status: 400 });
      return;
    }

    const existingSubscription = await subscribeRepository.findOne({
      where: { endpoint: subscription.endpoint },
    });

    if (existingSubscription) {
      return res.status(400).json({
        message: "سابسکرایب شما از قبل وجود دارد",
        status: 400,
      });
    }

    const newSubscription = subscribeRepository.create({
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      userPhone: existingUser.phone,
      isActive: true,
    });

    await subscribeRepository.save(newSubscription);

    console.log(newSubscription);
    res.status(201).json({ message: "اعلان فعال شد", status: 201 });
  } catch (error) {
    console.error("Error subscribing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function unsubscribeUser(req, res) {
  try {
    const userPhone = req.params.phone;

    const userRepository = getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { phone: userPhone },
    });

    if (!existingUser) {
      return res.status(400).json({ error: "کاربر وجود ندارد", status: 400 });
    }

    const subscribeRepository = getRepository(Subscribe);

    const userSubscriptions = await subscribeRepository.findOne({
      where: { userPhone: userPhone },
    });

    if (userSubscriptions.length === 0) {
      return res.status(400).json({ message: "سابسکرایب یافت نشد" });
    }

    await subscribeRepository.remove(userSubscriptions);

    res.status(200).json({ message: "اعلان غیر فعال شد", status: 200 });
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function sendNotif() {
  try {
    const subscribeRepository = getRepository(Subscribe);
    const onlineClassRepository = getRepository(OnlineClass);

    const currentTimestamp = new Date();

    const windowStart = new Date(currentTimestamp);
    windowStart.setSeconds(currentTimestamp.getSeconds() - 30);

    const windowEnd = new Date(currentTimestamp);
    windowEnd.setSeconds(currentTimestamp.getSeconds() + 30);

    const currentClass = await getRepository(OnlineClass)
      .createQueryBuilder("onlineClass")
      .leftJoinAndSelect("onlineClass.course", "course")
      .addSelect(["course.title", "course.imageUrl"])
      .where("onlineClass.start >= :windowStart", { windowStart })
      .andWhere("onlineClass.start <= :windowEnd", { windowEnd })
      .getOne();

    if (!currentClass) {
      console.log("No class found at the current timestamp");
      return;
    }

    const subscriptions = await subscribeRepository.find();

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions found");
      return;
    }

    const payload = {
      title: currentClass.title,
      body: `${currentClass.course.title} در حال برگزاری است`,
      icon: currentClass.course.imageUrl,
      badge: `https://baclassdevelop.liara.run/app/uploads/2024/02/192.png`,
    };

    for (const subscription of subscriptions) {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        console.error(`Error sending push notification:`, error.message);
      }
    }

    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error.message);
  }
}

const job = new cron.CronJob("* * * * *", async () => {
  await sendNotif();
  console.log("Notification job ran.");
});
job.start();
module.exports = { subscribeUser, sendNotif, unsubscribeUser };
