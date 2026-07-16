import React, { useState, useEffect } from "react";
// import "./App.css";

export default function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://opentdb.com/api.php?amount=10&type=multiple"
      );

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No questions found");
      }

      const formattedQuestions = data.results.map((question) => {
        const answers = [
          ...question.incorrect_answers,
          question.correct_answer,
        ];

        // Proper shuffle
        const shuffled = answers.sort(() => Math.random() - 0.5);

        return {
          question: decodeHTML(question.question),
          correctAnswer: decodeHTML(question.correct_answer),
          answers: shuffled.map((answer) => decodeHTML(answer)),
          category: question.category,
          difficulty: question.difficulty,
        };
      });

      setQuestions(formattedQuestions);
    } catch (err) {
      console.error(err);
      setError("Failed to load quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  // Decode HTML
  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  // Handle Answer
  const handleAnswerClick = (answer) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);

    if (answer === questions[currentQuestion].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  // Next Question
  const nextQuestion = () => {
    setSelectedAnswer(null);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // Restart Quiz
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    fetchQuestions();
  };

  // Loading
  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading Quiz...</h2>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>{error}</h2>
          <button onClick={fetchQuestions}>Retry</button>
        </div>
      </div>
    );
  }

  // Safety check
  if (questions.length === 0) return null;

  // Result Screen
  if (quizFinished) {
    const percentage = ((score / questions.length) * 100).toFixed(0);

    return (
      <div className="container">
        <div className="card result-card">
          <h1>Quiz Completed 🎉</h1>

          <h2>
            {score} / {questions.length}
          </h2>

          <p>{percentage}% Correct</p>

          <button onClick={restartQuiz}>Restart Quiz</button>
        </div>
      </div>
    );
  }

  const currentQuiz = questions[currentQuestion];

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className="header">
          <div>
            <h1> Quiz App</h1>
            <p>
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <div className="score-box">Score: {score}</div>
        </div>

        {/* Progress */}
        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${
                ((currentQuestion + 1) / questions.length) * 100
              }%`,
            }}
          ></div>
        </div>

        {/* Tags */}
        <div className="tags">
          <span className="tag purple">{currentQuiz.category}</span>
          <span className={`tag ${currentQuiz.difficulty}`}>
            {currentQuiz.difficulty}
          </span>
        </div>

        {/* Question */}
        <div className="question-box">
          <h2>{currentQuiz.question}</h2>
        </div>

        {/* Answers */}
        <div className="answers">
          {currentQuiz.answers.map((answer, index) => {
            let buttonClass = "answer-btn";

            if (selectedAnswer) {
              if (answer === currentQuiz.correctAnswer) {
                buttonClass += " correct";
              } else if (answer === selectedAnswer) {
                buttonClass += " wrong";
              }
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerClick(answer)}
                disabled={selectedAnswer !== null}
              >
                <strong>{String.fromCharCode(65 + index)}.</strong> {answer}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {selectedAnswer && (
          <div className="next-container">
            <button className="next-btn" onClick={nextQuestion}>
              {currentQuestion + 1 === questions.length
                ? "Finish Quiz"
                : "Next Question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}