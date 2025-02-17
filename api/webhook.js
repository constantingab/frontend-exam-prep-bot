const { bot } = require("../lib/bot");
const { webhookCallback } = require("grammy");

module.exports = async (req, res) => {
  console.log("Received webhook:", req.method, req.url);
  console.log("Request body:", req.body);

  try {
    await webhookCallback(bot, "https")(req, res); // Указываем протокол явно
  } catch (error) {
    console.error("Error in webhook handler:", error);
    res.status(500).send("Internal Server Error");
  }
};