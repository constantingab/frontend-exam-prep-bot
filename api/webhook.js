const { bot } = require("../lib/bot");
const { webhookCallback } = require("grammy");

module.exports = async (req, res) => {
  console.log("Received webhook:", req.method, req.url);
  console.log("Request body:", req.body);

  try {
    if (req.method === "POST") {
      await webhookCallback(bot, "https")(req, res);
    } else {
      res.status(405).send("Method Not Allowed");
    }
  } catch (error) {
    console.error("Error in webhook handler:", error);
    res.status(500).send("Internal Server Error");
  }
};
