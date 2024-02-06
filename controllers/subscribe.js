const { getRepository } = require("typeorm");
const webPush = require("web-push");
const Subscribe = require("../model/Subscribe");
webPush.setVapidDetails(
  "mailto:taherian.1993@gmail.com",
  "BE6Gh88dZcOUyOf7OObn6dA62nFJ1wZNAMEw4OQOjFhLG-g9OJR-DLKKh5w6Irxzs1IhPq3U0n68V4o-3soJP4g",
  "uFO0-a8RJYYEMzWN4iMbXpK8Rd7nv4ca9O--1szFfOI"
);
let subscriptions = [];

async function subscribeUser(req, res) {
  try {
    const { subscription } = req.body;
    const subscribeRepository = getRepository(Subscribe);
    const newSubscription = subscribeRepository.create({
      subscription,
    });

    await subscribeRepository.save(newSubscription);
    
    console.log(subscribeRepository);
    res.status(201).json({ message: "Subscription successful" });
  } catch (error) {
    console.error("Error subscribing user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function sendNotif(req, res) {
  try {
    const notificationPayload = {
      title: "باکلاس آنلاین",
      body: "کلاس شما شروع شده است",
    };

    if (subscriptions.length === 0) {
      return res.status(400).json({ error: "No subscriptions found" });
    }

    await Promise.all(
      subscriptions.map((sub) =>
        webPush.sendNotification(sub, JSON.stringify(notificationPayload))
      )
    );

    console.log(subscriptions);
    res.status(200).json({ message: "Push notifications sent successfully" });
  } catch (error) {
    console.error("Error sending push notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { subscribeUser, sendNotif };
