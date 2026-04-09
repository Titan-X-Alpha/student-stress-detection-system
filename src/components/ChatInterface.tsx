import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight } from 'lucide-react';
import { Question, UserAnswer, ChatMessage, FeatureCategory } from '../types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../data/questions';
import { selectNextQuestion } from '../engine/llmEngine';

interface ChatInterfaceProps {
  onComplete: (answers: UserAnswer[]) => void;
}

const INTRO_MESSAGES = [
  "Hello! I'm MindEase, your AI stress counselor. 👋",
  "I'll ask you a few questions to understand your current stress levels across 5 key areas.",
  "There are no right or wrong answers — just be honest with yourself. This is completely private. 🔒",
  "Let's begin with the first question...",
];

const BOT_AVATAR = (
  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
    <Brain className="w-4 h-4 text-white" />
  </div>
);

export default function ChatInterface({ onComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [usedCategories, setUsedCategories] = useState<FeatureCategory[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<'intro' | 'questioning' | 'done'>('intro');
  const [introStep, setIntroStep] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const totalQuestions = 5;

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showOptions, isTyping]);

  // Show intro messages sequentially
  useEffect(() => {
    if (phase === 'intro' && introStep < INTRO_MESSAGES.length) {
      const delay = introStep === 0 ? 400 : 1000;
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: `intro-${introStep}`,
            type: 'bot',
            content: INTRO_MESSAGES[introStep],
            timestamp: new Date(),
          }]);
          setIntroStep(prev => prev + 1);
        }, 800);
      }, delay);
      return () => clearTimeout(timer);
    }

    if (phase === 'intro' && introStep === INTRO_MESSAGES.length) {
      setTimeout(() => {
        setPhase('questioning');
        askNextQuestion([], []);
      }, 600);
    }
  }, [phase, introStep]);

  function askNextQuestion(cats: FeatureCategory[], qIds: string[]) {
    const result = selectNextQuestion(cats, qIds);
    if (!result) {
      setPhase('done');
      return;
    }

    const { question } = result;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setCurrentQuestion(question);
      setShowOptions(false);
      setSelectedOption(null);

      setMessages(prev => [...prev, {
        id: `q-${question.id}`,
        type: 'bot',
        content: question.question,
        timestamp: new Date(),
        questionData: question,
      }]);

      setTimeout(() => setShowOptions(true), 300);
    }, 900);
  }

  function handleAnswer(option: { label: string; value: number; emoji: string }) {
    if (!currentQuestion || selectedOption !== null) return;

    setSelectedOption(option.value);
    setShowOptions(false);

    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      question: currentQuestion.question,
      answer: option.label,
      score: option.value,
    };

    // Add user message
    const userMessage: ChatMessage = {
      id: `a-${currentQuestion.id}`,
      type: 'user',
      content: `${option.emoji} ${option.label}`,
      timestamp: new Date(),
      answerData: answer,
    };

    setMessages(prev => [...prev, userMessage]);

    const newAnswers = [...answers, answer];
    const newCats = [...usedCategories, currentQuestion.category];
    const newIds = [...usedQuestionIds, currentQuestion.id];

    setAnswers(newAnswers);
    setUsedCategories(newCats);
    setUsedQuestionIds(newIds);

    const newProgress = Math.round((newAnswers.length / totalQuestions) * 100);
    setProgress(newProgress);

    // Add brief acknowledgment
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const acks = [
          'Got it, thank you for sharing. 🙏',
          'Understood, that\'s helpful to know.',
          'Thanks for your honest response.',
          'Noted! Moving on...',
          'Perfect, one more area to explore.',
        ];
        const ack = acks[newAnswers.length - 1] || 'Thanks!';

        if (newAnswers.length < totalQuestions) {
          setMessages(prev => [...prev, {
            id: `ack-${currentQuestion.id}`,
            type: 'bot',
            content: ack,
            timestamp: new Date(),
          }]);
          setTimeout(() => askNextQuestion(newCats, newIds), 400);
        } else {
          // Final message before submitting
          setMessages(prev => [...prev, {
            id: 'final',
            type: 'bot',
            content: "Great, I have all the information I need! 🎉 Let me now analyze your responses using our AI model...",
            timestamp: new Date(),
          }]);
          setTimeout(() => onComplete(newAnswers), 1800);
        }
      }, 600);
    }, 400);
  }

  const categoryColors: Record<string, string> = {
    stress_emotional: 'bg-orange-100 text-orange-700 border-orange-200',
    sleep_quality: 'bg-violet-100 text-violet-700 border-violet-200',
    academic_pressure: 'bg-red-100 text-red-700 border-red-200',
    social_interaction: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    physical_activity: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">MindEase AI</div>
              <div className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Stress Assessment Active
              </div>
            </div>
          </div>

          {phase === 'questioning' && (
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-xs text-slate-400">{answers.length}/{totalQuestions}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.type === 'bot' && BOT_AVATAR}

                <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-first' : ''}`}>
                  {msg.questionData && (
                    <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border mb-1.5 ${categoryColors[msg.questionData.category]}`}>
                      <span>{CATEGORY_ICONS[msg.questionData.category]}</span>
                      <span>{CATEGORY_LABELS[msg.questionData.category]}</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.type === 'bot'
                        ? 'bg-white/10 backdrop-blur-sm border border-white/10 text-slate-200 rounded-tl-none'
                        : 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-500/20'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.answerData && (
                    <div className="text-xs text-slate-500 mt-1 text-right">
                      Score: {msg.answerData.score}/5 → {CATEGORY_LABELS[msg.answerData.category]}
                    </div>
                  )}
                </div>

                {msg.type === 'user' && (
                  <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                    👤
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-3"
              >
                {BOT_AVATAR}
                <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-violet-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer options */}
          <AnimatePresence>
            {showOptions && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-2 pl-12"
              >
                <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" /> Choose your response:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((opt, i) => (
                    <motion.button
                      key={opt.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => handleAnswer(opt)}
                      className="flex items-center gap-3 bg-white/5 hover:bg-white/12 border border-white/10 hover:border-violet-400/40 text-slate-200 text-sm px-4 py-3 rounded-xl transition-all text-left group"
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs text-slate-500 ml-auto">{opt.value}/5</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>
      </div>

      {/* Feature Tracker */}
      {phase === 'questioning' && (
        <div className="flex-shrink-0 border-t border-white/10 bg-slate-900/50 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs text-slate-500 mb-2">Stress Dimension Coverage</div>
            <div className="flex gap-2 flex-wrap">
              {(['stress_emotional', 'sleep_quality', 'academic_pressure', 'social_interaction', 'physical_activity'] as FeatureCategory[]).map(cat => {
                const covered = usedCategories.includes(cat);
                return (
                  <div
                    key={cat}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                      covered
                        ? 'bg-violet-500/20 border-violet-400/40 text-violet-300'
                        : 'bg-white/5 border-white/10 text-slate-500'
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    <span>{covered ? '✓ ' : ''}{CATEGORY_LABELS[cat]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
