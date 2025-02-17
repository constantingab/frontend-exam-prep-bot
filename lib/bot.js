require("dotenv").config();

const {
  Bot,
  Keyboard,
  InlineKeyboard,
  GrammyError,
  HttpError,
} = require("grammy");
const { getRandomQuestion, getCorrectAnswer } = require("./utils");

const bot = new Bot(process.env.BOT_API_KEY);

if (process.env.NODE_ENV !== "production") {
  bot.start();
}

// Add your existing bot logic here (commands, hears, etc.)
// ...

bot.command("start", async (ctx) => {
  // Сброс состояния пользователя, если используется FSM
  // await ctx.scene.leave();

  const startKeyboard = new Keyboard()
    .text("HTML")
    .text("CSS")
    .row()
    .text("JavaScript")
    .text("React")
    .row()
    .text("General")
    .text("GIT")
    .row()
    .text("VUE.JS")
    .text("Случайный вопрос")
    .resized();

  await ctx.reply(
    "Привет! Я - Frontend Interview Prep Bot 🤖 \nЯ помогу тебе подготовиться к интервью по фронтенду"
  );
  await ctx.reply("С чего начнем? Выбери тему вопроса в меню 👇", {
    reply_markup: startKeyboard,
  });
});

bot.hears(
  [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "General",
    "GIT",
    "VUE.JS",
    "Случайный вопрос",
  ],
  async (ctx) => {
    const topic = ctx.message.text.toLowerCase();
    const { question, questionTopic } = getRandomQuestion(topic);

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
  }
);

bot.on("callback_query:data", async (ctx) => {
  try {
    const callbackData = JSON.parse(ctx.callbackQuery.data);
    console.log("Parsed callback data:", callbackData); // Логируем распарсенные данные

    if (!callbackData.type || !callbackData.questionId) {
      console.error("Invalid callback data:", callbackData);
      await ctx.answerCallbackQuery({ text: "Некорректные данные." });
      return;
    }

    if (!callbackData.type.includes("option")) {
      const answer = getCorrectAnswer(
        callbackData.type,
        callbackData.questionId
      );
      console.log("Correct answer:", answer); // Логируем правильный ответ
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
    console.log("Correct answer for incorrect option:", answer); // Логируем ответ для неправильного варианта
    await ctx.reply(`Неверно ❌ Правильный ответ: ${answer}`);
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error("Error processing callback:", error);
    await ctx.answerCallbackQuery({
      text: "Произошла ошибка при обработке вашего ответа.",
    });
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

module.exports = { bot };
