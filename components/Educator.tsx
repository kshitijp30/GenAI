import React, { useState } from 'react';
import { EDUCATIONAL_TIPS, QUIZ_QUESTIONS } from '../constants';
import type { QuizQuestion, EducationalTip } from '../types';

const TipCard = ({ title, description, icon }: EducationalTip) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg flex items-start space-x-4 border border-gray-200 dark:border-gray-700/50">
    <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const question: QuizQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  const handleAnswerClick = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === question.correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      alert(`Quiz finished! Your score: ${score}/${QUIZ_QUESTIONS.length}`);
      setCurrentQuestionIndex(0);
      setScore(0);
    }
  };

  const getButtonClass = (index: number) => {
    if (!showResult) {
      return 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600';
    }
    if (index === question.correctAnswerIndex) {
      return 'bg-green-500 text-white';
    }
    if (index === selectedAnswer) {
      return 'bg-red-500 text-white';
    }
    return 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700/50">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Test Your Skills</h3>
      <div className="mt-4">
        <p className="text-gray-700 dark:text-gray-300">{question.question}</p>
        <div className="mt-4 space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-md transition-colors text-gray-800 dark:text-white disabled:cursor-not-allowed ${getButtonClass(index)}`}
            >
              {option}
            </button>
          ))}
        </div>
        {showResult && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
            <p className="text-gray-600 dark:text-gray-400">{question.explanation}</p>
            <button
              onClick={handleNextQuestion}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export const Educator = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">How to Spot Misinformation</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {EDUCATIONAL_TIPS.map((tip, index) => (
            <TipCard key={index} {...tip} />
          ))}
        </div>
      </div>
      <Quiz />
    </div>
  );
};