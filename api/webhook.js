const { bot } = require("../lib/bot");
const { webhookCallback } = require("grammy");

module.exports = async (req, res) => {
  console.log("Received webhook:", req.method, req.url);

  // Проверьте, что запрос это POST
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    // Запустите webhook обработку
    await webhookCallback(bot, "https")(req, res);
  } catch (error) {
    console.error("Error while processing webhook:", error);

    // Если возникает ошибка, отправляем 500 статус с подробным сообщением
    res.status(500).send("Internal Server Error: " + error.message);
  }
};
