import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from "../context/TelegramContext";
import '../styles/ RebaAcademy.css';
import confetti from 'canvas-confetti';

const explanation = {
  title: "Академия REBA",
  content: `
    Rebalancer – это индексный жетон в сети TON, приносящий прибыль с комиссий в пулах ликвидности. При каждой транзакции происходит комиссия, которая уходит в общий пул, из-за этого цена жетона растет.

    Как это работает?
    • С жетоном REBA создаются пулы ликвидности с разными перспективными монетами, такими как TON, USDT, LIBRA.
    • Цены на каждую из монет изменяются не пропорционально, поэтому в пулах ликвидности происходит ребалансировка на всех DEX биржах.
    • Приобретая токен REBALANCER, вы инвестируете в топовые проекты на платформе TON, словно формируя портфель из лучших компаний.
  `
};

const generalEducation = `
  Общее образование:
  • Пул ликвидности — это резерв 2x типов монет, например, TON и REBA, который используется для торговли на биржах.
  • Стейкинг монеты — это купленная монета, которую вы помещаете на площадку под %, локируя свой токен на определенное время.
  • Фарминг (или ликвидный фарминг) — это процесс предоставления монет в пул ликвидности биржи для получения вознаграждений в виде дополнительных монет.
`;

const questions = [
  {
    question: "Мы создали пул ликвидности с REBA / TON. Что происходит когда цена одной монет падает?",
    options: [
      "Если монета TON падает – жетон REBA выкупает TON",
      "Если жетон REBA падает – монета TON выкупает REBA",
      "Оба варианта верны"
    ],
    correctAnswer: 2
  },
  {
    question: "Можно ли поменять USDT на REBA если есть общий пул ликвидности? ",
    options: [
      "Да, можно",
      "Нет, нельзя",
      "Оба варианта верны"
    ],
    correctAnswer: 0
  },
  {
    question: "Можно ли поменять USDT на REBA если есть общий пул ликвидности? ",
    options: [
      "Купить жетон REBA и наслаждаться ростом актива",
      "Поместить в стейкинг REBA под %",
      "Поместить в фарминг REBA/TON под %",
      "Все варианты верны"
    ],
    correctAnswer: 3
  },
];

const RebaAcademy: React.FC = () => {
    const { tg } = useTelegram();
    const navigate = useNavigate();
    const [showExplanation, setShowExplanation] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
    useEffect(() => {
      if (tg) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => navigate('/tasks'));
      }
      return () => {
        if (tg) {
          tg.BackButton.offClick();
        }
      };
    }, [tg, navigate]);
  
    const handleStartQuiz = () => {
      setShowExplanation(false);
    };
  
    const handleAnswerSelect = (index: number) => {
      setSelectedAnswer(index);
      const correct = index === questions[currentQuestion].correctAnswer;
      setIsCorrect(correct);
      
      if (correct) {
        // Trigger confetti with a slight delay
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 100);
      }
    };
  
    const handleNextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        localStorage.setItem('academyCompleted', 'true');
        navigate('/tasks');
      }
    };
  
    if (showExplanation) {
      return (
        <div className="academy-container">
          <h1 className="academy-title">{explanation.title}</h1>
          <div className="explanation-content">{explanation.content}</div>
          <button className="check-knowledge-button" onClick={handleStartQuiz}>
            Проверить знания
          </button>
        </div>
      );
    }
  
    return (
      <div className="academy-container">
        <div className="general-education">{generalEducation}</div>
        <div className="question-card">
          <h2 className="question">{questions[currentQuestion].question}</h2>
        </div>
        <div className="options-card">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`option 
                ${selectedAnswer === index ? 'selected' : ''}
                ${selectedAnswer === index && isCorrect !== null ? (isCorrect ? 'correct' : 'incorrect') : ''}
              `}
              onClick={() => handleAnswerSelect(index)}
            >
              {option}
              {selectedAnswer === index && isCorrect !== null && (
                <span className="answer-icon">
                  {isCorrect ? '✅' : '🚫'}
                </span>
              )}
            </button>
          ))}
        </div>
        {isCorrect && (
          <button className="next-button" onClick={handleNextQuestion}>
            {currentQuestion < questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
          </button>
        )}
      </div>
    );
  };
  
  export default RebaAcademy;