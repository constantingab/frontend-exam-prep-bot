const { bot } = require("../lib/bot"); // Добавляем импорт бота
const { webhookCallback } = require("grammy");

module.exports = async (req, res) => {
  console.log("Received webhook:", req.method, req.url);
  console.log("Request body:", req.body);

  try {
    await webhookCallback(bot)(req, res);
  } catch (error) {
    console.error("Error in webhook handler:", error);
    res.status(500).send("Internal Server Error");
  }
};
