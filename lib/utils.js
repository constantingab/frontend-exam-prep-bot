const questions = require("../questions.json");
const { Random } = require("random-js");

const getRandomQuestion = (topic) => {
  const random = new Random();

  let questionTopic = topic.toLowerCase();

  if (questionTopic === "случайный вопрос") {
    // Получаем список доступных тем
    const availableTopics = Object.keys(questions);

    // Если в questions нет данных для всех тем, выбираем случайную тему
    questionTopic =
      availableTopics[random.integer(0, availableTopics.length - 1)];
  }

  // Проверяем, существует ли выбранная тема
  if (!questions[questionTopic]) {
    return null; // Если темы нет, возвращаем null
  }

  const randomQuestionIndex = random.integer(
    0,
    questions[questionTopic].length - 1
  );

  return {
    question: questions[questionTopic][randomQuestionIndex],
    questionTopic,
  };
};

const getCorrectAnswer = (topic, id) => {
  const question = questions[topic].find((question) => question.id === id);

  if (!question.hasOptions) {
    return question.answer;
  }

  return question.options.find((option) => option.isCorrect).text;
};

module.exports = { getRandomQuestion, getCorrectAnswer };
