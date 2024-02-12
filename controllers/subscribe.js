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
    res.status(201).json({ message: "با موفقیت انجام شد", status: 201 });
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

    const existingSubscription = await subscribeRepository.findOne({
      where: { userPhone: userPhone },
    });

    if (!existingSubscription) {
      return res.status(400).json({ message: "سابسکرایب یافت نشد" });
    }

    await subscribeRepository.remove(existingSubscription);

    res.status(200).json({ message: "با موفقیت لغو شد" });
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function sendNotif(req, res) {
  try {
    const subscribeRepository = getRepository(Subscribe);
    const subscriptions = await subscribeRepository.find();
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(400).json({ error: "No subscriptions found" });
    }

    console.log(">>>> " + JSON.stringify(subscriptions));

    const payload = {
      title: "باکلاس آنلاین",
      body: `کلاس  شروع شده است`,
      icon: "https://baclassdevelop.liara.run/app/uploads/2024/02/192.png",
    };

    const notificationPromises = subscriptions.map(async (subscription) => {
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
        console.log(`Notification sent to ${subscription.endpoint}`);
      } catch (error) {
        console.error(
          `Error sending push notification to ${subscription.endpoint}:`,
          error
        );
      }
    });

    await Promise.all(notificationPromises);

    res.status(200).json({ message: "Push notifications sent successfully" });
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// async function sendNotif(req, res) {
//   try {
//     // const currentTimestamp = new Date();
//     // console.log(`currentTimestamp : ${currentTimestamp}`);
//     // const upcomingClasses = await getRepository(OnlineClass).find({
//     //   where: {
//     //     start: MoreThanOrEqual(currentTimestamp),
//     //   },
//     // });

//     const subscribeRepository = getRepository(Subscribe);

//     const subscriptions = await subscribeRepository.find();

//     if (!subscriptions || subscriptions.length === 0) {
//       return res.status(400).json({ error: "No subscriptions found" });
//     }

//     // for (const onlineClass of upcomingClasses) {
//     try {
//       const payload = {
//         title: "باکلاس آنلاین",
//         body: `کلاس  شروع شده است`,
//         icon: "https://baclassdevelop.liara.run/app/uploads/2024/02/192.png",
//       };

//       // for (const sub of subscriptions) {
//       await webPush.sendNotification(
//         {
//           endpoint: subscriptions.endpoint,
//           keys: {
//             auth: subscriptions.auth,
//             p256dh: subscriptions.p256dh,
//           },
//         },
//         JSON.stringify(payload)
//       );
//       // }
//     } catch (error) {
//       console.error("Error sending push notification:", error);
//     }
//     // }

//     res.status(200).json({ message: "Push notifications sent successfully" });
//   } catch (error) {
//     console.error("Error sending push notification:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

// setInterval(() => {
//   const req = {};
//   const res = {
//     status: (code) => ({
//       json: (data) => console.log(data),
//     }),
//   };

//   sendNotif(req, res);
//   console.log("time req");
// }, 60000);

// console.log("time req");
module.exports = { subscribeUser, sendNotif, unsubscribeUser };
