require("dotenv").config();
const {
  Bot,
  webhookCallback,
  Keyboard,
  InlineKeyboard,
  GrammyError,
  HttpError,
} = require("grammy");
const { getRandomQuestion, getCorrectAnswer } = require("./utils");

const bot = new Bot(process.env.BOT_API_KEY);

const TIMEOUT = 10000; // Время ожидания в миллисекундах (10 секунд)

const withTimeout = (promise, timeout) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), timeout)
  );
  return Promise.race([promise, timeoutPromise]);
};

bot.command("start", async (ctx) => {
  const startKeyboard = new Keyboard()
    .text("💻 HTML")
    .text("🎨 CSS")
    .row()
    .text("🖥 JavaScript")
    .text("⚛️ React")
    .row()
    .text("📚 General")
    .text("🔧 GIT")
    .row()
    .text("🎲 Случайный вопрос")
    .resized();

  await ctx.reply(
    "Привет! Я - Frontend Interview Prep Bot 🤖 \nЯ помогу тебе подготовиться к интервью по фронтенду"
  );
  await ctx.reply("С чего начнем? Выбери тему вопроса в меню 👇", {
    reply_markup: startKeyboard,
  });
});

bot.hears(
  ["HTML", "CSS", "JavaScript", "React", "General", "GIT", "Случайный вопрос"],
  async (ctx) => {
    const topic = ctx.message.text.toLowerCase();

    try {
      const { question, questionTopic } = await withTimeout(
        Promise.resolve(getRandomQuestion(topic)),
        TIMEOUT
      );

      if (!question) {
        await ctx.reply("Не удалось найти вопрос для этой темы.");
        return;
      }

      let inlineKeyboard;

      if (question.hasOptions) {
        const buttonRows = question.options.map((option) => [
          InlineKeyboard.text(
            option.text,
            JSON.stringify({
              type: `${questionTopic}-option`,
              isCorrect: option.isCorrect,
              questionId: question.id,
            })
          ),
        ]);

        inlineKeyboard = InlineKeyboard.from(buttonRows);
      } else {
        inlineKeyboard = new InlineKeyboard().text(
          "Узнать ответ",
          JSON.stringify({
            type: questionTopic,
            questionId: question.id,
          })
        );
      }

      await ctx.reply(question.text, {
        reply_markup: inlineKeyboard,
      });
    } catch (error) {
      console.error("Ошибка обработки запроса:", error);
      await ctx.reply("Произошла ошибка. Попробуйте снова позже.");
    }
  }
);

bot.on("callback_query:data", async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data);

  if (!callbackData.type.includes("option")) {
    const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);
    await ctx.reply(answer, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    await ctx.answerCallbackQuery();
    return;
  }

  if (callbackData.isCorrect) {
    await ctx.reply("Верно ✅");
    await ctx.answerCallbackQuery();
    return;
  }

  const answer = getCorrectAnswer(
    callbackData.type.split("-")[0],
    callbackData.questionId
  );
  await ctx.reply(`Неверно ❌ Правильный ответ: ${answer}`);
  await ctx.answerCallbackQuery();
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err);

  // Логируем детали ошибки
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }

  // Отправляем сообщение пользователю, если ошибка произошла
  if (ctx) {
    ctx.reply(
      "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже."
    );
  }
});

module.exports = { bot };
