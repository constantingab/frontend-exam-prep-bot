const questions = require("../questions.json");
const { Random } = require("random-js");

const getRandomQuestion = (topic) => {
  const random = new Random();

  let questionTopic = topic.toLowerCase();

  if (questionTopic === "случайный вопрос") {
    questionTopic =
      Object.keys(questions)[
        random.integer(0, Object.keys(questions).length - 1)
      ];
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

  if (!question) {
    console.error(`Question not found for topic: ${topic}, id: ${id}`);
    return "Ответ не найден.";
  }

  if (!question.hasOptions) {
    return question.answer;
  }

  const correctOption = question.options.find((option) => option.isCorrect);
  if (!correctOption) {
    console.error(`No correct option found for question id: ${id}`);
    return "Правильный ответ не найден.";
  }

  return correctOption.text;
};

module.exports = { getRandomQuestion, getCorrectAnswer };
