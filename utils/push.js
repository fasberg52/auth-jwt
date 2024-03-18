const webPush = require("web-push");

export async function sendNotif(req, res) {
  const vapidKeys = {
    publicKey:
      "BE6Gh88dZcOUyOf7OObn6dA62nFJ1wZNAMEw4OQOjFhLG-g9OJR-DLKKh5w6Irxzs1IhPq3U0n68V4o-3soJP4g",
    privateKey: "uFO0-a8RJYYEMzWN4iMbXpK8Rd7nv4ca9O--1szFfOI",
  };

  webPush.setVapidDetails(
    "mailto:taheiran.1993@gmail.com", 
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}
