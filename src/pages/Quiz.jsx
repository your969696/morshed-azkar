import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { speakArabic, stopSpeaking } from '../utils/sound';
import { allQuizQuestions as quizQuestions } from '../data/quiz-questions/index';

const categories = {
  all: { ar: 'الكل', en: 'All' },
  salah: { ar: 'الصلاة', en: 'Prayer' },
  wudu: { ar: 'الوضوء', en: 'Ablution' },
  fasting: { ar: 'الصوم', en: 'Fasting' },
  zakah: { ar: 'الزكاة', en: 'Zakat' },
  hajj: { ar: 'الحج', en: 'Pilgrimage' },
  aqeedah: { ar: 'العقيدة', en: 'Faith' },
  tahara: { ar: 'الطهارة', en: 'Purity' },
  death: { ar: 'الموت والدفن', en: 'Death & Burial' },
  afterlife: { ar: 'البعث والقيامة', en: 'Resurrection' },
  jannah: { ar: 'الجنة والنار', en: 'Paradise & Hell' },
  seerah: { ar: 'السيرة', en: 'Seerah' },
  quran_test: { ar: 'اختبار القرآن', en: 'Quran Test' },
  hadith_test: { ar: 'اختبار الأحاديث', en: 'Hadith Test' },
  fiqh: { ar: 'الفقه', en: 'Fiqh' },
  daily: { ar: 'حياة المسلم', en: 'Daily Life' },
  adab: { ar: 'الآداب والأخلاق', en: 'Manners & Ethics' },
  dua: { ar: 'الأدعية والأذكار', en: 'Duas & Adhkar' },
  prophets: { ar: 'قصص الأنبياء', en: 'Prophets Stories' },
  angels: { ar: 'الملائكة', en: 'Angels' },
  books: { ar: 'الكتب السماوية', en: 'Holy Books' },
  marriage: { ar: 'الزواج والعلاقات', en: 'Marriage & Relations' },
  food: { ar: 'الأطعمة والشراب', en: 'Food & Drink' },
  history: { ar: 'التاريخ الإسلامي', en: 'Islamic History' },
};



const TIME_PER_QUESTION = 30;

const categoryEntries = Object.entries(categories).filter(([key]) => key !== 'all');

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDifficultyConfig(difficulty) {
  switch (difficulty) {
    case 'easy':
      return {
        label: 'سهل', color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
        border: 'rgba(34,197,94,0.25)', icon: '○',
      };
    case 'medium':
      return {
        label: 'متوسط', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
        border: 'rgba(245,158,11,0.25)', icon: '◐',
      };
    case 'hard':
      return {
        label: 'صعب', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',
        border: 'rgba(239,68,68,0.25)', icon: '●',
      };
    default:
      return {
        label: '', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',
        border: 'rgba(148,163,184,0.25)', icon: '',
      };
  }
}

function getResultConfig(percentage) {
  if (percentage === 100) return {
    text: 'ممتاز! إجابة صحيحة على جميع الأسئلة!',
    emoji: '🏆', color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
  };
  if (percentage >= 80) return {
    text: 'أحسنت! أداء رائع!',
    emoji: '🌟', color: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
  };
  if (percentage >= 60) return {
    text: 'جيد، واصل التعلم!',
    emoji: '📚', color: '#3b82f6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
  };
  if (percentage >= 40) return {
    text: 'ليس سيئاً، حاول مرة أخرى!',
    emoji: '💪', color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
  };
  return {
    text: 'لا تيأس، المراجعة سر النجاح!',
    emoji: '📖', color: '#ef4444',
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
  };
}

const arabicLetters = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

/* ═══════════════ BACKGROUND ═══════════════ */
function QuizBackground() {
  return (
    <div className="quiz-bg">
      <div className="quiz-bg-gradient" />
      <div className="quiz-bg-pattern" />
      <div className="quiz-orb quiz-orb-1" />
      <div className="quiz-orb quiz-orb-2" />
      <div className="quiz-grain" />
    </div>
  );
}

/* ═══════════════ HEADER ═══════════════ */
function QuizHeader({ current, total, onBack }) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="quiz-header">
      <div className="quiz-header-top">
        <button className="quiz-back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="quiz-header-center">
          <span className="quiz-header-counter">
            <span className="quiz-header-current">{current}</span>
            <span className="quiz-header-sep">/</span>
            <span className="quiz-header-total">{total}</span>
          </span>
        </div>

        <div className="quiz-header-score-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      </div>

      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}
        />
      </div>
    </div>
  );
}

/* ═══════════════ TIMER ═══════════════ */
function QuizTimer({ timeLeft, totalTime }) {
  const percent = (timeLeft / totalTime) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const getColor = () => {
    if (timeLeft <= 5) return '#ef4444';
    if (timeLeft <= 10) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className="quiz-timer">
      <svg width="38" height="38" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 22 22)"
          style={{ transition: 'stroke-dashoffset 0.8s linear' }}
        />
      </svg>
      <span className="quiz-timer-text" style={{ color: getColor() }}>{timeLeft}</span>
    </div>
  );
}

/* ═══════════════ QUESTION CARD ═══════════════ */
function QuestionCard({ question, isSpeaking, onToggleSpeak, index }) {
  const diffConfig = getDifficultyConfig(question.difficulty);

  return (
    <div className="quiz-question-card">
      <div className="quiz-q-header">
        <div className="quiz-q-meta">
          <span
            className="quiz-q-badge"
            style={{
              background: diffConfig.bg,
              color: diffConfig.color,
              borderColor: diffConfig.border,
            }}
          >
            {diffConfig.label}
          </span>
        </div>

        <button
          className={`quiz-speak-btn ${isSpeaking ? 'active' : ''}`}
          onClick={onToggleSpeak}
        >
          {isSpeaking ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </div>

      <p className="quiz-q-text">{question.question_ar}</p>
    </div>
  );
}

/* ═══════════════ ANSWER OPTION ═══════════════ */
function AnswerOption({ option, index, isSelected, isCorrect, isRevealed, disabled, onSelect }) {
  let stateClass = '';
  let borderColor = 'rgba(255,255,255,0.06)';
  let bgColor = 'rgba(255,255,255,0.03)';
  let textColor = 'var(--q-text)';
  let iconBg = 'rgba(255,255,255,0.06)';
  let iconColor = 'rgba(255,255,255,0.35)';

  if (isRevealed) {
    if (isCorrect) {
      borderColor = 'rgba(34,197,94,0.5)';
      bgColor = 'rgba(34,197,94,0.08)';
      textColor = '#22c55e';
      iconBg = '#22c55e';
      iconColor = '#0a0a0f';
    } else if (isSelected) {
      borderColor = 'rgba(239,68,68,0.5)';
      bgColor = 'rgba(239,68,68,0.08)';
      textColor = '#ef4444';
      iconBg = '#ef4444';
      iconColor = '#fff';
    } else {
      borderColor = 'rgba(255,255,255,0.03)';
      bgColor = 'rgba(255,255,255,0.01)';
      textColor = 'rgba(255,255,255,0.25)';
      iconBg = 'rgba(255,255,255,0.03)';
      iconColor = 'rgba(255,255,255,0.15)';
    }
  }

  const iconContent = isRevealed
    ? (isCorrect ? '✓' : isSelected ? '✗' :arabicLetters[index])
    :arabicLetters[index];

  return (
    <button
      className="quiz-option"
      style={{
        borderColor,
        background: bgColor,
        color: textColor,
      }}
      onClick={() => onSelect(index)}
      disabled={disabled}
    >
      <div
        className="quiz-option-icon"
        style={{ background: iconBg, color: iconColor }}
      >
        {iconContent}
      </div>
      <span className="quiz-option-text">{option}</span>
      {isRevealed && isCorrect && (
        <div className="quiz-option-check">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      )}
      {isRevealed && isSelected && !isCorrect && (
        <div className="quiz-option-check">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
      )}
    </button>
  );
}

/* ═══════════════ EXPLANATION ═══════════════ */
function ExplanationPanel({ question, isCorrect, timedOut, source }) {
  return (
    <div className="quiz-explanation">
      {timedOut && (
        <div className="quiz-timeout-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>انتهى الوقت! الإجابة الصحيحة: <strong>{question.options_ar[question.correct_index]}</strong></span>
        </div>
      )}

      <div className={`quiz-expl-card ${isCorrect ? 'correct' : timedOut ? 'timeout' : 'wrong'}`}>
        <div className="quiz-expl-header">
          <div className={`quiz-expl-icon ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            )}
          </div>
          <span className={`quiz-expl-title ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? 'إجابة صحيحة!' : 'الشرح'}
          </span>
        </div>

        <p className="quiz-expl-text">{question.explanation_ar}</p>

        {question.source && (
          <div className="quiz-expl-source">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>{question.source}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ QUIZ SCREEN ═══════════════ */
function QuizScreen({ questions, currentIndex, onAnswer, onReveal, onNext, onBack }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const nextBtnRef = useRef(null);
  const scrollRef = useRef(null);
  const question = questions[currentIndex];

  // Reset on question change
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setTimedOut(false);
    setTimeLeft(TIME_PER_QUESTION);
    setIsPaused(false);
  }, [currentIndex]);

  // Auto-scroll to Next button after answering
  useEffect(() => {
    if (isAnswered && nextBtnRef.current) {
      setTimeout(() => {
        nextBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }, [isAnswered]);

  // No auto-advance — user clicks "التالي" when ready to read explanation

  // Timer
  useEffect(() => {
    if (isAnswered || isPaused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, isAnswered, isPaused]);

  // Time up
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered) {
      setIsAnswered(true);
      setShowExplanation(true);
      setTimedOut(true);
      const newAnswers = [...answers, { id: question.id, correct: false, timedOut: true }];
      setAnswers(newAnswers);
      onAnswer(false, true);
    }
  }, [timeLeft, isAnswered]);

  const handleSelect = (index) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    stopSpeaking();
    setIsAnswered(true);
    setSelectedAnswer(index);
    setShowExplanation(true);
    setTimedOut(false);
    const isCorrect = index === question.correct_index;
    if (isCorrect) setScore((prev) => prev + 1);
    const newAnswers = [...answers, { id: question.id, correct: isCorrect }];
    setAnswers(newAnswers);
    onAnswer(isCorrect, false);
  };

  const handleReveal = () => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    stopSpeaking();
    setIsAnswered(true);
    setShowExplanation(true);
    setTimedOut(false);
    const newAnswers = [...answers, { id: question.id, correct: false, revealed: true }];
    setAnswers(newAnswers);
    onAnswer(false, false);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakArabic(question.question_ar);
      setIsSpeaking(true);
      const check = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(check);
        }
      }, 200);
    }
  };

  const isLastQuestion = currentIndex >= questions.length - 1;

  return (
    <div className="quiz-play">
      <QuizHeader
        current={currentIndex + 1}
        total={questions.length}
        onBack={onBack}
      />

      <div className="quiz-play-body">
          <div key={currentIndex} className="quiz-question-wrapper">
            <QuestionCard
              question={question}
              isSpeaking={isSpeaking}
              onToggleSpeak={toggleSpeak}
              index={currentIndex}
            />

            <div className="quiz-timer-row">
              <QuizTimer timeLeft={timeLeft} totalTime={TIME_PER_QUESTION} />
              <div className="quiz-timer-label">
                <span className="quiz-timer-sec">{isPaused ? '⏸' : timeLeft}</span>
                <span className="quiz-timer-text-label">{isPaused ? 'متوقف مؤقتاً' : 'ثانية متبقية'}</span>
              </div>
              {!isAnswered && (
                <button
                  className={`quiz-pause-btn ${isPaused ? 'paused' : ''}`}
                  onClick={togglePause}
                >
                  {isPaused ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            <div className="quiz-options">
              {question.options_ar.map((option, index) => (
                <AnswerOption
                  key={index}
                  option={option}
                  index={index}
                  isSelected={selectedAnswer === index}
                  isCorrect={index === question.correct_index}
                  isRevealed={isAnswered}
                  disabled={isAnswered}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {!isAnswered && (
              <button
                className="quiz-reveal-btn"
                onClick={handleReveal}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>أظهر الإجابة</span>
              </button>
            )}

              {showExplanation && (
                <ExplanationPanel
                  question={question}
                  isCorrect={answers[answers.length - 1]?.correct}
                  timedOut={timedOut}
                  source={question.source}
                />
              )}

            {isAnswered && (
              <button
                ref={nextBtnRef}
                className="quiz-next-btn"
                onClick={() => onNext()}
              >
                <span>{isLastQuestion ? 'عرض النتائج' : 'السؤال التالي'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
      </div>
    </div>
  );
}

/* ═══════════════ MENU SCREEN ═══════════════ */
function MenuScreen({ onStart }) {
  const [quizLength, setQuizLength] = useState(0);

  const categoryIcons = {
    salah: '🕌', wudu: '💧', fasting: '🌙', zakah: '💰',
    hajj: '🕋', aqeedah: '☪️', tahara: '💧', death: '⚰️',
    afterlife: '🌍',     jannah: '🕌', seerah: '📜',
    quran_test: '📖', hadith_test: '📜', fiqh: '📚',
    daily: '☀️', adab: '🤝', dua: '🤲', prophets: '🕌',
    angels: '👼', books: '📖', marriage: '💍', food: '🍽️',
    history: '📅',
  };

  const categoryColors = [
    { from: '#1e3a5f', to: '#0f2744', accent: '#3b82f6' },
    { from: '#0f3d3e', to: '#082525', accent: '#22c55e' },
    { from: '#3d2e0f', to: '#251c08', accent: '#f59e0b' },
    { from: '#2d1b4e', to: '#1a1030', accent: '#a855f7' },
    { from: '#3d1525', to: '#250d18', accent: '#f43f5e' },
    { from: '#0f3535', to: '#081e1e', accent: '#06b6d4' },
    { from: '#1b2550', to: '#101830', accent: '#6366f1' },
    { from: '#3d1b30', to: '#251020', accent: '#ec4899' },
    { from: '#0f3d35', to: '#082520', accent: '#14b8a6' },
    { from: '#3d2a0f', to: '#251a08', accent: '#f97316' },
    { from: '#2d1b5f', to: '#1a1040', accent: '#8b5cf6' },
  ];

  const lengthOptions = [
    { count: 5, label: 'قصير', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ), desc: '5 أسئلة', time: '2.5 دقيقة' },
    { count: 10, label: 'متوسط', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8M16 17H8M10 9H8" />
      </svg>
    ), desc: '10 أسئلة', time: '5 دقائق' },
    { count: 20, label: 'طويل', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ), desc: '20 سؤال', time: '10 دقائق' },
    { count: 0, label: 'الكل', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ), desc: 'كل الأسئلة', time: 'حسب العدد' },
  ];

  return (
    <div className="quiz-menu">
      <QuizBackground />

      <div className="quiz-menu-scroll">
        {/* Hero */}
        <div className="quiz-menu-hero">
          <div className="quiz-hero-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="quiz-hero-title">اختبر معلوماتك</h1>
          <p className="quiz-hero-sub">اختبار في العلوم الإسلامية</p>
          <div className="quiz-hero-stats">
            <span className="quiz-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              {quizQuestions.length} سؤال
            </span>
            <span className="quiz-stat-sep" />
            <span className="quiz-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {categoryEntries.length} موضوع
            </span>
          </div>
        </div>

        {/* Quiz Length */}
        <div className="quiz-menu-section">
          <h2 className="quiz-section-title">عدد الأسئلة</h2>
          <div className="quiz-length-grid">
            {lengthOptions.map((opt) => (
              <button
                key={opt.count}
                className={`quiz-length-card ${quizLength === opt.count ? 'active' : ''}`}
                onClick={() => setQuizLength(opt.count)}
              >
                <div className="quiz-length-icon">{opt.icon}</div>
                <span className="quiz-length-label">{opt.label}</span>
                <span className="quiz-length-count">{opt.desc}</span>
                <span className="quiz-length-time">{opt.time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start All */}
        <div className="quiz-menu-section">
          <button
            className="quiz-start-all"
            onClick={() => onStart('all', quizLength)}
          >
            <div className="quiz-start-bg-pattern" />
            <div className="quiz-start-content">
              <div className="quiz-start-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="quiz-start-text">
                <h3>اختبار شامل</h3>
                <p>من جميع المواضيع — {quizLength === 0 ? 'كل الأسئلة' : quizLength + ' سؤال'}</p>
              </div>
              <div className="quiz-start-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Categories */}
        <div className="quiz-menu-section">
          <h2 className="quiz-section-title">اختر موضوع الاختبار</h2>
          <div className="quiz-categories">
            {categoryEntries.map(([key, value], index) => {
              const count = quizQuestions.filter((q) => q.category === key).length;
              const color = categoryColors[index % categoryColors.length];

              return (
                <button
                  key={key}
                  className="quiz-category-card"
                  onClick={() => onStart(key, quizLength)}
                  style={{
                    background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                    borderColor: `${color.accent}33`,
                  }}
                >
                  <div className="quiz-cat-icon">{categoryIcons[key] || '📖'}</div>
                  <div className="quiz-cat-info">
                    <h4 className="quiz-cat-name">{value.ar}</h4>
                    <span className="quiz-cat-count" style={{ color: color.accent }}>
                      {count} سؤال
                    </span>
                  </div>
                  <div className="quiz-cat-arrow" style={{ color: color.accent }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}

/* ═══════════════ RESULTS SCREEN ═══════════════ */
function ResultsScreen({ score, total, categoryScores, onRetry, onBack }) {
  const percentage = Math.round((score / total) * 100);
  const resultConfig = getResultConfig(percentage);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const categoryBreakdown = useMemo(() => {
    return Object.entries(categoryScores)
      .map(([catKey, data]) => {
        const catInfo = categories[catKey] || { ar: catKey };
        const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        let status = 'weak';
        if (pct >= 80) status = 'strong';
        else if (pct >= 50) status = 'medium';
        return { key: catKey, name: catInfo.ar, correct: data.correct, total: data.total, percentage: pct, status };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [categoryScores]);

  const strongTopics = categoryBreakdown.filter((c) => c.status === 'strong');
  const weakTopics = categoryBreakdown.filter((c) => c.status === 'weak');

  return (
    <div className="quiz-results">
      <QuizBackground />

      <div className="quiz-results-scroll">
        {/* Score Circle */}
        <div className="quiz-results-hero">
          <div className="quiz-score-ring-wrap">
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke={resultConfig.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="quiz-score-inner">
              <span
                className="quiz-score-number"
                style={{ color: resultConfig.color }}
              >
                {percentage}%
              </span>
              <span className="quiz-score-fraction">{score}/{total}</span>
            </div>
          </div>

          <div
            className="quiz-result-msg"
          >
            <span className="quiz-result-emoji">{resultConfig.emoji}</span>
            <p className="quiz-result-text" style={{ color: resultConfig.color }}>{resultConfig.text}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div
            className="quiz-results-section"
          >
            <h3 className="quiz-results-section-title">تفاصيل الأداء</h3>
            <div className="quiz-category-results">
              {categoryBreakdown.map((cat, index) => {
                const statusColors = {
                  strong: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: '✦' },
                  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '◐' },
                  weak: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: '△' },
                };
                const sc = statusColors[cat.status];

                return (
                  <div
                    key={cat.key}
                    className="quiz-cat-result-item"
                  >
                    <div className="quiz-cat-result-top">
                      <div className="quiz-cat-result-left">
                        <span className="quiz-cat-result-icon" style={{ color: sc.color }}>{sc.icon}</span>
                        <span className="quiz-cat-result-name">{cat.name}</span>
                      </div>
                      <span className="quiz-cat-result-score" style={{ color: sc.color }}>
                        {cat.correct}/{cat.total}
                      </span>
                    </div>
                    <div className="quiz-cat-bar-track">
                      <div
                        className="quiz-cat-bar-fill"
                        style={{ background: sc.color, width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analysis */}
        {categoryBreakdown.length > 0 && (strongTopics.length > 0 || weakTopics.length > 0) && (
          <div
            className="quiz-results-section"
          >
            <div className="quiz-analysis-card">
              <h4 className="quiz-analysis-title">تحليل الأداء</h4>
              {strongTopics.length > 0 && (
                <div className="quiz-analysis-row strong">
                  <span className="quiz-analysis-icon">✦</span>
                  <div>
                    <span className="quiz-analysis-label">نقاط القوة</span>
                    <p className="quiz-analysis-topics">{strongTopics.map((c) => c.name).join(' · ')}</p>
                  </div>
                </div>
              )}
              {weakTopics.length > 0 && (
                <div className="quiz-analysis-row weak">
                  <span className="quiz-analysis-icon">△</span>
                  <div>
                    <span className="quiz-analysis-label">تحتاج مراجعة</span>
                    <p className="quiz-analysis-topics">{weakTopics.map((c) => c.name).join(' · ')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          className="quiz-results-actions"
        >
          <button
            className="quiz-action-primary"
            onClick={onRetry}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            <span>أعد الاختبار</span>
          </button>
          <button
            className="quiz-action-secondary"
            onClick={onBack}
          >
            <span>العودة للقائمة</span>
          </button>
        </div>

        <div style={{ height: 100 }} />
      </div>
    </div>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function Quiz() {
  const [screen, setScreen] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [categoryScores, setCategoryScores] = useState({});

  const startQuiz = useCallback((categoryKey, quizLength = 10) => {
    let pool = categoryKey === 'all' ? [...quizQuestions] : quizQuestions.filter((q) => q.category === categoryKey);
    const actualLength = quizLength === 0 ? pool.length : quizLength;
    const selected = shuffleArray(pool).slice(0, Math.min(actualLength, pool.length));
    setQuestions(selected);
    setSelectedCategory(categoryKey);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setCategoryScores({});
    setScreen('quiz');
    stopSpeaking();
  }, []);

  const handleAnswer = useCallback((isCorrect, timedOut) => {
    const q = questions[currentIndex];
    if (!q) return;
    if (isCorrect) setScore((prev) => prev + 1);
    setCategoryScores((prev) => ({
      ...prev,
      [q.category]: {
        total: (prev[q.category]?.total || 0) + 1,
        correct: (prev[q.category]?.correct || 0) + (isCorrect ? 1 : 0),
      },
    }));
  }, [currentIndex, questions]);

  const handleNext = useCallback(() => {
    stopSpeaking();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setScreen('results');
    }
  }, [currentIndex, questions.length]);

  const goToMenu = useCallback(() => {
    stopSpeaking();
    setScreen('menu');
    setSelectedCategory(null);
    setQuestions([]);
    setCurrentIndex(0);
  }, []);

  const retryQuiz = useCallback(() => {
    if (selectedCategory) startQuiz(selectedCategory);
    else goToMenu();
  }, [selectedCategory, startQuiz, goToMenu]);

  return (
    <div className="quiz-root">
      <QuizBackground />

        {screen === 'menu' && (
          <MenuScreen onStart={startQuiz} />
        )}
        {screen === 'quiz' && questions.length > 0 && (
          <QuizScreen
            questions={questions}
            currentIndex={currentIndex}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onBack={goToMenu}
          />
        )}
        {screen === 'results' && (
          <ResultsScreen
            score={score}
            total={questions.length}
            categoryScores={categoryScores}
            onRetry={retryQuiz}
            onBack={goToMenu}
          />
        )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&display=swap');

        :root {
          --q-bg: #08080f;
          --q-surface: rgba(255,255,255,0.035);
          --q-surface-h: rgba(255,255,255,0.06);
          --q-border: rgba(255,255,255,0.06);
          --q-border-h: rgba(255,255,255,0.12);
          --q-text: #f0ece4;
          --q-text-m: #7a7570;
          --q-text-d: #3e3b38;
          --q-green: #22c55e;
          --q-gold: #f59e0b;
          --q-red: #ef4444;
          --q-blue: #3b82f6;
          --q-r: 14px;
          --q-rs: 10px;
          --q-font: 'Cairo', sans-serif;
          --q-display: 'Amiri', serif;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .quiz-root {
          min-height: 100%;
          background: var(--q-bg);
          font-family: var(--q-font);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Background ── */
        .quiz-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .quiz-bg-gradient {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(34,197,94,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 85% 80%, rgba(245,158,11,0.03) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 10% 60%, rgba(59,130,246,0.025) 0%, transparent 50%);
        }
        .quiz-bg-pattern {
          position: absolute; inset: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .quiz-orb {
          position: absolute; border-radius: 50%; filter: blur(100px);
        }
        .quiz-orb-1 { width: 350px; height: 350px; top: -120px; right: -80px; background: rgba(34,197,94,0.04); animation: qFloat 25s ease-in-out infinite; }
        .quiz-orb-2 { width: 280px; height: 280px; bottom: -60px; left: -60px; background: rgba(245,158,11,0.03); animation: qFloat 30s ease-in-out infinite reverse; }
        .quiz-grain {
          position: absolute; inset: 0; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }
        @keyframes qFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px,-15px) scale(1.05); }
          66% { transform: translate(-15px,10px) scale(0.95); }
        }

        /* ── Menu ── */
        .quiz-menu {
          position: relative; z-index: 1;
          width: 100%; min-height: 100%; max-width: 480px;
          margin: 0 auto;
        }
        .quiz-menu-scroll {
          overflow-y: auto;
          padding: 24px 20px;
          scrollbar-width: none;
        }
        .quiz-menu-scroll::-webkit-scrollbar { display: none; }

        /* Hero */
        .quiz-menu-hero {
          text-align: center; padding: 20px 0 28px;
        }
        .quiz-hero-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(34,197,94,0.08); border: 1.5px solid rgba(34,197,94,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: var(--q-green);
        }
        .quiz-hero-title {
          font-family: var(--q-display); font-size: 1.8rem;
          font-weight: 700; color: var(--q-text); margin-bottom: 4px;
        }
        .quiz-hero-sub {
          font-size: 0.85rem; color: var(--q-text-m); margin-bottom: 16px;
        }
        .quiz-hero-stats {
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
        }
        .quiz-stat {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.75rem; color: var(--q-text-m); font-weight: 500;
        }
        .quiz-stat-sep {
          width: 3px; height: 3px; border-radius: 50%;
          background: var(--q-text-d);
        }

        /* Section */
        .quiz-menu-section { margin-bottom: 28px; }
        .quiz-section-title {
          font-size: 0.82rem; font-weight: 700; color: var(--q-text-m);
          margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;
        }

        /* Quiz Length */
        .quiz-length-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
        }
        .quiz-length-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; padding: 16px 8px;
          background: var(--q-surface); border: 1.5px solid var(--q-border);
          border-radius: var(--q-r);
          cursor: pointer; transition: all 0.3s; color: var(--q-text-m);
        }
        .quiz-length-card:hover {
          border-color: var(--q-border-h); background: var(--q-surface-h);
        }
        .quiz-length-card.active {
          border-color: var(--q-green); background: rgba(34,197,94,0.06);
          color: var(--q-green); box-shadow: 0 0 20px rgba(34,197,94,0.08);
        }
        .quiz-length-icon { margin-bottom: 4px; opacity: 0.7; }
        .quiz-length-card.active .quiz-length-icon { opacity: 1; }
        .quiz-length-label { font-size: 0.85rem; font-weight: 700; }
        .quiz-length-count { font-size: 0.68rem; opacity: 0.6; }
        .quiz-length-time { font-size: 0.62rem; opacity: 0.4; }

        /* Start All */
        .quiz-start-all {
          width: 100%; border: none; border-radius: var(--q-r);
          overflow: hidden; cursor: pointer;
          background: linear-gradient(135deg, #0f4a2e, #082a1a, #0a3320);
          border: 1px solid rgba(34,197,94,0.3);
          padding: 0; transition: all 0.3s;
          box-shadow: 0 4px 24px rgba(34,197,94,0.12);
        }
        .quiz-start-all:hover {
          box-shadow: 0 8px 40px rgba(34,197,94,0.2);
          border-color: rgba(34,197,94,0.5);
        }
        .quiz-start-bg-pattern {
          position: absolute; inset: 0; opacity: 0.05;
          background: radial-gradient(circle at 20% 50%, rgba(34,197,94,0.3), transparent 50%),
                      radial-gradient(circle at 80% 30%, rgba(34,197,94,0.2), transparent 40%);
        }
        .quiz-start-content {
          position: relative; display: flex; align-items: center;
          gap: 16px; padding: 24px 20px;
        }
        .quiz-start-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: var(--q-green); flex-shrink: 0;
          backdrop-filter: blur(8px);
        }
        .quiz-start-text { flex: 1; text-align: right; }
        .quiz-start-text h3 {
          font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 2px;
        }
        .quiz-start-text p { font-size: 0.78rem; color: rgba(255,255,255,0.5); }
        .quiz-start-arrow {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: var(--q-green); flex-shrink: 0;
        }

        /* Categories */
        .quiz-categories {
          display: flex; flex-direction: column; gap: 8px;
        }
        .quiz-category-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: var(--q-r);
          border: 1px solid; cursor: pointer;
          transition: all 0.3s; text-align: right;
          width: 100%;
        }
        .quiz-cat-icon { font-size: 1.6rem; flex-shrink: 0; }
        .quiz-cat-info { flex: 1; min-width: 0; }
        .quiz-cat-name {
          font-size: 0.92rem; font-weight: 700; color: #fff;
          margin-bottom: 2px; font-family: var(--q-font);
        }
        .quiz-cat-count {
          font-size: 0.7rem; font-weight: 600;
          background: rgba(255,255,255,0.08);
          padding: 2px 8px; border-radius: 20px;
          display: inline-block;
        }
        .quiz-cat-arrow {
          flex-shrink: 0; opacity: 0.6;
        }

        /* ── Quiz Play ── */
        .quiz-play {
          position: relative; z-index: 1;
          width: 100%; min-height: 100%; max-width: 480px;
          margin: 0 auto;
          display: flex; flex-direction: column;
          padding-bottom: 12px;
        }
        .quiz-play-body {
          flex: 1; overflow-y: auto;
          padding: 0 12px 12px;
          scrollbar-width: none;
        }
        .quiz-play-body::-webkit-scrollbar { display: none; }
        .quiz-question-wrapper {
          display: flex; flex-direction: column; gap: 10px;
        }

        /* Header */
        .quiz-header {
          padding: 12px 20px 8px;
          position: relative; z-index: 5;
        }
        .quiz-header-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .quiz-back-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: var(--q-surface); border: 1px solid var(--q-border);
          border-radius: var(--q-rs); color: var(--q-text-m);
          cursor: pointer; transition: all 0.2s;
        }
        .quiz-back-btn:hover { color: var(--q-text); background: var(--q-surface-h); }
        .quiz-header-center { text-align: center; }
        .quiz-header-counter { font-weight: 800; font-size: 0.9rem; }
        .quiz-header-current { color: var(--q-green); }
        .quiz-header-sep { color: var(--q-text-d); margin: 0 2px; }
        .quiz-header-total { color: var(--q-text-m); }
        .quiz-header-score-badge {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: var(--q-surface); border: 1px solid var(--q-border);
          border-radius: var(--q-rs); color: var(--q-gold);
        }
        .quiz-progress-track {
          width: 100%; height: 3px; border-radius: 3px;
          background: rgba(255,255,255,0.05); overflow: hidden;
        }
        .quiz-progress-fill {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, var(--q-green), rgba(34,197,94,0.5));
        }

        /* Timer */
        .quiz-timer-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 14px;
          background: var(--q-surface); border: 1px solid var(--q-border);
          border-radius: var(--q-r);
        }
        .quiz-timer {
          position: relative; width: 38px; height: 38px; flex-shrink: 0;
        }
        .quiz-timer-text {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 800;
        }
        .quiz-timer-label { flex: 1; }
        .quiz-timer-sec {
          font-size: 1.4rem; font-weight: 800; color: var(--q-text);
          display: block; line-height: 1;
        }
        .quiz-timer-text-label {
          font-size: 0.72rem; color: var(--q-text-m); font-weight: 500;
        }
        .quiz-pause-btn {
          width: 38px; height: 38px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); border: 1px solid var(--q-border);
          border-radius: var(--q-rs); color: var(--q-text-m);
          cursor: pointer; transition: all 0.3s;
        }
        .quiz-pause-btn:hover { background: rgba(255,255,255,0.1); color: var(--q-text); }
        .quiz-pause-btn.paused {
          background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.3);
          color: var(--q-gold);
        }

        /* Question Card */
        .quiz-question-card {
          background: var(--q-surface);
          border: 1px solid var(--q-border);
          border-radius: var(--q-r);
          padding: 14px 16px;
        }
        .quiz-q-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .quiz-q-badge {
          font-size: 0.72rem; font-weight: 700;
          padding: 4px 12px; border-radius: 20px;
          border: 1px solid;
        }
        .quiz-speak-btn {
          position: relative;
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          background: var(--q-surface); border: 1px solid var(--q-border);
          border-radius: var(--q-rs); color: var(--q-text-m);
          cursor: pointer; transition: all 0.3s;
        }
        .quiz-speak-btn.active {
          background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3);
          color: var(--q-green);
        }
        .quiz-speak-rings {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .quiz-speak-ring {
          position: absolute; width: 40px; height: 40px;
          border-radius: 50%; border: 1px solid var(--q-green);
        }
        .quiz-q-text {
          font-family: var(--q-display); font-size: 1.05rem;
          line-height: 1.9; color: var(--q-text);
          text-align: right;
        }

        /* Options */
        .quiz-options { display: flex; flex-direction: column; gap: 6px; }
        .quiz-option {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: var(--q-r);
          border: 1.5px solid; cursor: pointer;
          transition: all 0.25s; text-align: right;
          width: 100%; font-family: var(--q-font);
        }
        .quiz-option-icon {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 800; flex-shrink: 0;
          transition: all 0.25s;
        }
        .quiz-option-text {
          flex: 1; font-size: 0.88rem; font-weight: 600;
          line-height: 1.5;
        }
        .quiz-option-check { flex-shrink: 0; }
        .quiz-option:disabled { cursor: default; }

        /* Reveal */
        .quiz-reveal-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; padding: 10px;
          background: rgba(245,158,11,0.06); border: 1.5px solid rgba(245,158,11,0.2);
          border-radius: var(--q-r); color: var(--q-gold);
          font-family: var(--q-font); font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.3s;
        }
        .quiz-reveal-btn:hover {
          background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.4);
        }

        /* Explanation */
        .quiz-explanation {
          overflow: hidden;
        }
        .quiz-timeout-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--q-rs);
          font-size: 0.82rem; color: #f87171;
          margin-bottom: 8px;
        }
        .quiz-timeout-banner strong { color: var(--q-green); }
        .quiz-expl-card {
          background: var(--q-surface);
          border: 1px solid var(--q-border);
          border-radius: var(--q-r); padding: 12px 14px;
        }
        .quiz-expl-card.correct { border-color: rgba(34,197,94,0.2); }
        .quiz-expl-card.wrong { border-color: rgba(245,158,11,0.2); }
        .quiz-expl-card.timeout { border-color: rgba(239,68,68,0.2); }
        .quiz-expl-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 10px;
        }
        .quiz-expl-icon {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .quiz-expl-icon.correct {
          background: rgba(34,197,94,0.1); color: var(--q-green);
        }
        .quiz-expl-icon.wrong {
          background: rgba(245,158,11,0.1); color: var(--q-gold);
        }
        .quiz-expl-title { font-size: 0.85rem; font-weight: 700; }
        .quiz-expl-title.correct { color: var(--q-green); }
        .quiz-expl-title.wrong { color: var(--q-gold); }
        .quiz-expl-text {
          font-family: var(--q-display); font-size: 0.88rem;
          line-height: 1.7; color: var(--q-text-m);
        }
        .quiz-expl-source {
          display: flex; align-items: center; gap: 6px;
          margin-top: 12px; padding-top: 10px;
          border-top: 1px solid var(--q-border);
          font-size: 0.72rem; color: var(--q-gold); font-weight: 600;
        }

        /* Next Button */
        .quiz-next-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; width: 100%; padding: 12px;
          background: linear-gradient(135deg, var(--q-green), #16a34a);
          border: none; border-radius: var(--q-r);
          color: #fff; font-family: var(--q-font);
          font-size: 0.88rem; font-weight: 700;
          cursor: pointer; transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(34,197,94,0.2);
        }
        .quiz-next-btn:hover {
          box-shadow: 0 8px 32px rgba(34,197,94,0.3);
        }
        .quiz-auto-advance-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          font-size: 0.82rem; font-weight: 800;
          flex-shrink: 0;
        }

        /* ── Results ── */
        .quiz-results {
          position: relative; z-index: 1;
          width: 100%; min-height: 100%; max-width: 480px;
          margin: 0 auto;
        }
        .quiz-results-scroll {
          overflow-y: auto;
          padding: 24px 20px;
          scrollbar-width: none;
        }
        .quiz-results-scroll::-webkit-scrollbar { display: none; }
        .quiz-results-hero {
          text-align: center; padding: 20px 0 28px;
        }
        .quiz-score-ring-wrap {
          position: relative; width: 140px; height: 140px;
          margin: 0 auto 20px;
        }
        .quiz-score-inner {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
        }
        .quiz-score-number {
          font-size: 2rem; font-weight: 800; line-height: 1;
        }
        .quiz-score-fraction {
          font-size: 0.75rem; color: var(--q-text-m); font-weight: 600;
        }
        .quiz-result-msg {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .quiz-result-emoji { font-size: 2rem; }
        .quiz-result-text {
          font-size: 1rem; font-weight: 700;
        }

        /* Results Section */
        .quiz-results-section { margin-bottom: 20px; }
        .quiz-results-section-title {
          font-size: 0.82rem; font-weight: 700; color: var(--q-text-m);
          margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .quiz-category-results {
          display: flex; flex-direction: column; gap: 6px;
        }
        .quiz-cat-result-item {
          padding: 12px 16px;
          background: var(--q-surface); border: 1px solid var(--q-border);
          border-radius: var(--q-rs);
        }
        .quiz-cat-result-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .quiz-cat-result-left {
          display: flex; align-items: center; gap: 8px;
        }
        .quiz-cat-result-icon { font-size: 0.8rem; }
        .quiz-cat-result-name {
          font-size: 0.82rem; font-weight: 600; color: var(--q-text);
        }
        .quiz-cat-result-score {
          font-size: 0.78rem; font-weight: 700;
        }
        .quiz-cat-bar-track {
          width: 100%; height: 4px; border-radius: 4px;
          background: rgba(255,255,255,0.05); overflow: hidden;
        }
        .quiz-cat-bar-fill { height: 100%; border-radius: 4px; }

        /* Analysis */
        .quiz-analysis-card {
          padding: 18px;
          background: var(--q-surface); border: 1px solid var(--q-border);
          border-radius: var(--q-r);
        }
        .quiz-analysis-title {
          font-size: 0.85rem; font-weight: 700; color: var(--q-text);
          margin-bottom: 12px;
        }
        .quiz-analysis-row {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 0;
        }
        .quiz-analysis-row + .quiz-analysis-row { border-top: 1px solid var(--q-border); }
        .quiz-analysis-icon { font-size: 0.85rem; margin-top: 2px; }
        .quiz-analysis-row.strong .quiz-analysis-icon { color: var(--q-green); }
        .quiz-analysis-row.weak .quiz-analysis-icon { color: var(--q-red); }
        .quiz-analysis-label {
          font-size: 0.78rem; font-weight: 600; color: var(--q-text-m);
          display: block; margin-bottom: 2px;
        }
        .quiz-analysis-topics {
          font-size: 0.75rem; color: var(--q-text-d); line-height: 1.5;
        }

        /* Actions */
        .quiz-results-actions {
          display: flex; flex-direction: column; gap: 10px;
          margin-top: 8px;
        }
        .quiz-action-primary {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; width: 100%; padding: 15px;
          background: linear-gradient(135deg, var(--q-green), #16a34a);
          border: none; border-radius: var(--q-r);
          color: #fff; font-family: var(--q-font);
          font-size: 0.92rem; font-weight: 700;
          cursor: pointer; transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(34,197,94,0.2);
        }
        .quiz-action-primary:hover {
          box-shadow: 0 8px 32px rgba(34,197,94,0.3);
        }
        .quiz-action-secondary {
          width: 100%; padding: 14px;
          background: var(--q-surface); border: 1px solid var(--q-border);
          border-radius: var(--q-r);
          color: var(--q-text); font-family: var(--q-font);
          font-size: 0.88rem; font-weight: 600;
          cursor: pointer; transition: all 0.3s;
        }
        .quiz-action-secondary:hover {
          border-color: var(--q-border-h); background: var(--q-surface-h);
        }

        /* ── Mobile ── */
        @media (max-height: 700px) {
          .quiz-hero-title { font-size: 1.5rem; }
          .quiz-length-card { padding: 12px 6px; }
          .quiz-question-card { padding: 16px; }
          .quiz-option { padding: 14px 14px; }
          .quiz-q-text { font-size: 1.05rem; line-height: 1.9; }
        }
        @media (max-width: 380px) {
          .quiz-menu-scroll { padding: 16px 12px; }
          .quiz-length-grid { gap: 6px; }
        }
      `}</style>
    </div>
  );
}