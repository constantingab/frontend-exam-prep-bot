const { webhookCallback } = require('grammy');
const { bot } = require('../lib/bot');

module.exports = async (req, res) => {
  console.log('Received webhook:', req.method, req.url);

  try {
    await webhookCallback(bot, 'http')(req, res);
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).send('Internal Server Error');
  }
};