import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const STEPS = [
  { label: 'Extracting feature vectors...', sub: 'Mapping answers → [1–5] scores', icon: '📊', duration: 800 },
  { label: 'Running Random Forest ensemble...', sub: '20 decision trees voting', icon: '🌳', duration: 1200 },
  { label: 'Aggregating tree predictions...', sub: 'Calculating probability distribution', icon: '🤖', duration: 900 },
  { label: 'Calibrating stress classification...', sub: 'Applying weighted feature scoring', icon: '⚖️', duration: 700 },
  { label: 'Generating LLM recommendations...', sub: 'GPT-4o crafting personalized tips', icon: '✨', duration: 1000 },
  { label: 'Analysis complete!', sub: 'Preparing your results...', icon: '🎯', duration: 500 },
];

interface AnalyzingScreenProps {
  onComplete: () => void;
}

export default function AnalyzingScreen({ onComplete }: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let stepIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;

    function runStep() {
      if (stepIndex >= STEPS.length) {
        setTimeout(onComplete, 400);
        return;
      }
      setCurrentStep(stepIndex);
      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex]);
        stepIndex++;
        setTimeout(runStep, 150);
      }, STEPS[stepIndex].duration);
    }

    setTimeout(runStep, 300);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  const progress = completedSteps.length / STEPS.length * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Central brain animation */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>

            {/* Orbit rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border border-violet-400/20 rounded-full"
                style={{
                  margin: `-${(i + 1) * 14}px`,
                  borderStyle: i === 1 ? 'dashed' : 'solid',
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 3 + i * 1.5, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white text-center mb-2"
        >
          Analyzing Your Stress Profile
        </motion.h2>
        <p className="text-slate-400 text-center text-sm mb-8">
          Our ML pipeline is processing your responses...
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>ML Pipeline Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const isCompleted = completedSteps.includes(i);
            const isCurrent = i === currentStep && !isCompleted;
            const isPending = i > currentStep;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  isCurrent ? 'bg-violet-500/15 border border-violet-500/30' :
                  isCompleted ? 'bg-white/5' : 'bg-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                  isCompleted ? 'bg-green-500/20 border border-green-500/30' :
                  isCurrent ? 'bg-violet-500/30 border border-violet-500/50' :
                  'bg-white/5 border border-white/10'
                }`}>
                  {isCompleted ? '✓' : isCurrent ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⟳
                    </motion.span>
                  ) : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${
                    isCompleted ? 'text-green-400' :
                    isCurrent ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{step.sub}</div>
                </div>
                {isCurrent && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(j => (
                      <motion.div
                        key={j}
                        className="w-1 h-1 bg-violet-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.2 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Model info */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Algorithm', value: 'Random Forest' },
            { label: 'Trees', value: '20 Estimators' },
            { label: 'Features', value: '5 Dimensions' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">{item.label}</div>
              <div className="text-xs font-semibold text-slate-300">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
