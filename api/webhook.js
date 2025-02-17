module.exports = async (req, res) => {
    console.log("Received webhook:", req.method, req.url); // Логирование запроса
    console.log("Request body:", req.body); // Логирование тела запроса

    try {
      await webhookCallback(bot)(req, res);
    } catch (error) {
      console.error("Error in webhook handler:", error);
      res.status(500).send("Internal Server Error");
    }
  };

