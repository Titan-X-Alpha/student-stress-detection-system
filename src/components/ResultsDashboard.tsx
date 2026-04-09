import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { Brain, RotateCcw, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { PredictionResult, Recommendation, UserAnswer } from '../types';
import { STRESS_LEVEL_META } from '../engine/llmEngine';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ICONS } from '../data/questions';

interface ResultsDashboardProps {
  result: PredictionResult;
  recommendations: Recommendation[];
  answers: UserAnswer[];
  onRestart: () => void;
}

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 border-red-400/30 text-red-400',
  medium: 'bg-amber-500/10 border-amber-400/30 text-amber-400',
  low: 'bg-green-500/10 border-green-400/30 text-green-400',
};

export default function ResultsDashboard({
  result,
  recommendations,
  answers,
  onRestart,
}: ResultsDashboardProps) {
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'recommendations' | 'technical'>('overview');

  const meta = STRESS_LEVEL_META[result.stress_level];

  // Radar data
  const radarData = [
    { subject: 'Emotional', A: result.features.stress_emotional, fullMark: 5 },
    { subject: 'Sleep', A: 6 - result.features.sleep_quality, fullMark: 5 }, // invert
    { subject: 'Academic', A: result.features.academic_pressure, fullMark: 5 },
    { subject: 'Social', A: 6 - result.features.social_interaction, fullMark: 5 }, // invert
    { subject: 'Physical', A: 6 - result.features.physical_activity, fullMark: 5 }, // invert
  ];

  // Bar data for breakdown
  const barData = [
    { name: 'Emotional', raw: result.features.stress_emotional, stress: result.features.stress_emotional, fill: CATEGORY_COLORS.stress_emotional },
    { name: 'Sleep', raw: result.features.sleep_quality, stress: 6 - result.features.sleep_quality, fill: CATEGORY_COLORS.sleep_quality },
    { name: 'Academic', raw: result.features.academic_pressure, stress: result.features.academic_pressure, fill: CATEGORY_COLORS.academic_pressure },
    { name: 'Social', raw: result.features.social_interaction, stress: 6 - result.features.social_interaction, fill: CATEGORY_COLORS.social_interaction },
    { name: 'Physical', raw: result.features.physical_activity, stress: 6 - result.features.physical_activity, fill: CATEGORY_COLORS.physical_activity },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'breakdown', label: 'Breakdown', icon: '🔍' },
    { key: 'recommendations', label: 'Relief Tips', icon: '💡' },
    { key: 'technical', label: 'Technical', icon: '🔬' },
  ] as const;

  const confidencePct = Math.round(result.confidence * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/70 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">MindEase Results</span>
          </div>
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retake
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stress Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden bg-gradient-to-br ${meta.gradient} rounded-3xl p-8 mb-8 shadow-2xl`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="text-6xl mb-4">{meta.emoji}</div>
            <div className="text-white/80 text-sm font-medium mb-1">Your Stress Level</div>
            <div className="text-5xl font-extrabold text-white mb-3">{result.stress_level}</div>
            <div className="text-white/90 text-sm mb-4 max-w-md">{meta.description}</div>

            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-white/70 text-xs">Model Confidence</div>
                <div className="text-white font-bold text-xl">{confidencePct}%</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-white/70 text-xs">Main Issue</div>
                <div className="text-white font-semibold text-sm capitalize">{result.dominant_issue}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advice banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 mb-6"
        >
          <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">{meta.advice}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Radar Chart */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-1">Stress Dimension Radar</h3>
                <p className="text-slate-400 text-xs mb-4">Higher values = higher stress contribution</p>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#ffffff15" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Radar
                      name="Stress"
                      dataKey="A"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Probability distribution */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Classification Probability</h3>
                <div className="space-y-3">
                  {(['Low', 'Moderate', 'High', 'Severe'] as const).map(level => {
                    const pct = Math.round(result.probabilities[level] * 100);
                    const colors: Record<string, string> = {
                      Low: 'from-green-500 to-emerald-500',
                      Moderate: 'from-amber-500 to-yellow-500',
                      High: 'from-orange-500 to-red-500',
                      Severe: 'from-red-500 to-rose-600',
                    };
                    return (
                      <div key={level}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className={`font-medium ${level === result.stress_level ? 'text-white' : 'text-slate-400'}`}>
                            {level === result.stress_level && '► '}{level}
                          </span>
                          <span className={`font-bold ${level === result.stress_level ? 'text-white' : 'text-slate-500'}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`h-full bg-gradient-to-r ${colors[level]} rounded-full`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'breakdown' && (
            <motion.div
              key="breakdown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Feature Scores */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Stress Contribution by Dimension</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 8, color: '#e2e8f0' }}
                      formatter={(val) => [`${val}/5`, 'Stress Score']}
                    />
                    <Bar dataKey="stress" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {barData.map((item, i) => {
                  const feature = Object.keys(CATEGORY_LABELS)[i] as keyof typeof CATEGORY_LABELS;
                  const label = CATEGORY_LABELS[feature];
                  const icon = CATEGORY_ICONS[feature];
                  const stressScore = item.stress;
                  const severity = stressScore <= 2 ? 'Low' : stressScore <= 3 ? 'Moderate' : stressScore <= 4 ? 'High' : 'Severe';
                  const severityColors = { Low: 'text-green-400', Moderate: 'text-amber-400', High: 'text-orange-400', Severe: 'text-red-400' };
                  const userAnswer = answers.find(a => a.category === feature);

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{icon}</span>
                          <div>
                            <div className="text-sm font-medium text-white">{label}</div>
                            <div className={`text-xs font-medium ${severityColors[severity]}`}>{severity} Risk</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{stressScore}</div>
                          <div className="text-xs text-slate-500">/5</div>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="h-1.5 bg-white/10 rounded-full mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stressScore / 5) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: item.fill }}
                        />
                      </div>

                      {userAnswer && (
                        <div className="text-xs text-slate-400">
                          Your answer: <span className="text-slate-300">"{userAnswer.answer}"</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Your Responses */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Your Responses Summary</h3>
                <div className="space-y-3">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                      <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[a.category]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-400 mb-0.5">{CATEGORY_LABELS[a.category]}</div>
                        <div className="text-sm text-slate-300 leading-snug">{a.question}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-violet-300">→ {a.answer}</span>
                          <span className="text-xs text-slate-500">(score: {a.score}/5)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="text-sm font-medium text-white mb-0.5">AI-Generated Recommendations</div>
                  <div className="text-xs text-slate-400">
                    These suggestions are generated by our LLM based on your stress profile:
                    <strong className="text-slate-300"> {result.stress_level} stress</strong> with{' '}
                    <strong className="text-slate-300">{result.dominant_issue}</strong> as the primary issue.
                  </div>
                </div>
              </div>

              {recommendations.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                    className="w-full flex items-center gap-4 p-4 text-left"
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {rec.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-white">{rec.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[rec.priority]}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{rec.category}</div>
                    </div>
                    <div className="flex-shrink-0 text-slate-400">
                      {expandedRec === rec.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedRec === rec.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                          {rec.description}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              <div className="text-xs text-slate-500 text-center pt-2">
                ⚠️ These are general wellness suggestions and not medical advice.
                If you're experiencing severe distress, please consult a healthcare professional.
              </div>
            </motion.div>
          )}

          {activeTab === 'technical' && (
            <motion.div
              key="technical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* ML Output */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>🤖</span> ML Model Output
                </h3>
                <div className="font-mono text-sm bg-slate-950/50 rounded-xl p-4 border border-white/5 overflow-x-auto">
                  <div className="text-slate-500 mb-2">{'// Random Forest Prediction Result'}</div>
                  <div className="text-green-400">{'{'}</div>
                  <div className="ml-4 text-slate-300">
                    <div><span className="text-violet-300">"model"</span>: <span className="text-amber-300">"RandomForestClassifier"</span>,</div>
                    <div><span className="text-violet-300">"n_estimators"</span>: <span className="text-blue-300">20</span>,</div>
                    <div><span className="text-violet-300">"input_features"</span>: {'{'}</div>
                    <div className="ml-4">
                      {Object.entries(result.features).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-cyan-300">"{k}"</span>: <span className="text-amber-300">{v}</span>,
                        </div>
                      ))}
                    </div>
                    <div>{'} ,'}</div>
                    <div><span className="text-violet-300">"prediction"</span>: <span className="text-green-300">"{result.stress_level}"</span>,</div>
                    <div><span className="text-violet-300">"confidence"</span>: <span className="text-amber-300">{result.confidence.toFixed(4)}</span>,</div>
                    <div><span className="text-violet-300">"probabilities"</span>: {'{'}</div>
                    <div className="ml-4">
                      {Object.entries(result.probabilities).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-cyan-300">"{k}"</span>: <span className="text-amber-300">{(v as number).toFixed(4)}</span>,
                        </div>
                      ))}
                    </div>
                    <div>{'}'}</div>
                  </div>
                  <div className="text-green-400">{'}'}</div>
                </div>
              </div>

              {/* Flask API Structure */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>🐍</span> Flask Backend API Spec
                </h3>
                <div className="space-y-3">
                  {[
                    { method: 'POST', path: '/generate-question', desc: 'LLM generates next adaptive question', req: '{ used_categories: [], session_id: "..." }', res: '{ question: "...", category: "sleep_quality" }' },
                    { method: 'POST', path: '/submit-answer', desc: 'Maps user answer to feature score', req: '{ category: "...", answer: "Often", session_id: "..." }', res: '{ score: 4, feature_updated: true }' },
                    { method: 'POST', path: '/predict-stress', desc: 'Runs Random Forest model', req: '{ features: { stress_emotional: 3, ... } }', res: '{ stress_level: "High", confidence: 0.82, probabilities: {...} }' },
                    { method: 'POST', path: '/get-recommendations', desc: 'LLM generates personalized tips', req: '{ stress_level: "High", dominant_issue: "...", features: {...} }', res: '[{ title: "...", description: "...", priority: "high" }, ...]' },
                  ].map((api, i) => (
                    <div key={i} className="bg-slate-950/50 border border-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${api.method === 'POST' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                          {api.method}
                        </span>
                        <span className="text-sm font-mono text-violet-300">{api.path}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{api.desc}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Request:</div>
                          <div className="font-mono text-xs text-slate-400 bg-white/5 p-2 rounded-lg">{api.req}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Response:</div>
                          <div className="font-mono text-xs text-green-400 bg-white/5 p-2 rounded-lg">{api.res}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Python ML Code */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>🌳</span> Training Code (Python / scikit-learn)
                </h3>
                <div className="font-mono text-xs bg-slate-950/80 rounded-xl p-4 border border-white/5 overflow-x-auto leading-relaxed">
                  <div className="text-slate-500">{'# stress_model_training.py'}</div>
                  <div className="text-blue-300 mt-2">{'import pandas as pd'}</div>
                  <div className="text-blue-300">{'from sklearn.ensemble import RandomForestClassifier'}</div>
                  <div className="text-blue-300">{'from sklearn.linear_model import LogisticRegression'}</div>
                  <div className="text-blue-300">{'from sklearn.model_selection import train_test_split'}</div>
                  <div className="text-blue-300">{'from sklearn.metrics import classification_report, accuracy_score'}</div>
                  <div className="text-blue-300">{'from sklearn.preprocessing import StandardScaler'}</div>
                  <div className="text-blue-300">{'import pickle'}</div>
                  <br />
                  <div className="text-slate-500">{'# Load dataset'}</div>
                  <div className="text-slate-300">{'df = pd.read_csv(\'data/stress_dataset.csv\')'}</div>
                  <div className="text-slate-300">{'FEATURES = [\'stress_emotional\',\'sleep_quality\','}</div>
                  <div className="text-slate-300">{'           \'academic_pressure\',\'social_interaction\','}</div>
                  <div className="text-slate-300">{'           \'physical_activity\']'}</div>
                  <br />
                  <div className="text-slate-300">{'X = df[FEATURES]'}</div>
                  <div className="text-slate-300">{'y = df[\'stress_level\']'}</div>
                  <br />
                  <div className="text-slate-500">{'# Train-test split (80/20)'}</div>
                  <div className="text-slate-300">{'X_train, X_test, y_train, y_test = train_test_split('}</div>
                  <div className="text-slate-300">{'    X, y, test_size=0.2, random_state=42, stratify=y)'}</div>
                  <br />
                  <div className="text-slate-500">{'# Model 1: Logistic Regression (baseline)'}</div>
                  <div className="text-slate-300">{'scaler = StandardScaler()'}</div>
                  <div className="text-slate-300">{'X_train_s = scaler.fit_transform(X_train)'}</div>
                  <div className="text-slate-300">{'X_test_s = scaler.transform(X_test)'}</div>
                  <div className="text-slate-300">{'lr = LogisticRegression(max_iter=1000)'}</div>
                  <div className="text-slate-300">{'lr.fit(X_train_s, y_train)'}</div>
                  <div className="text-green-400">{'print(f"LR Accuracy: {accuracy_score(y_test, lr.predict(X_test_s)):.3f}")'}</div>
                  <br />
                  <div className="text-slate-500">{'# Model 2: Random Forest (final model)'}</div>
                  <div className="text-slate-300">{'rf = RandomForestClassifier('}</div>
                  <div className="text-slate-300">{'    n_estimators=100, max_depth=8,'}</div>
                  <div className="text-slate-300">{'    random_state=42, class_weight=\'balanced\')'}</div>
                  <div className="text-slate-300">{'rf.fit(X_train, y_train)'}</div>
                  <div className="text-green-400">{'print(f"RF Accuracy: {accuracy_score(y_test, rf.predict(X_test)):.3f}")'}</div>
                  <div className="text-green-400">{'print(classification_report(y_test, rf.predict(X_test)))'}</div>
                  <br />
                  <div className="text-slate-500">{'# Save model'}</div>
                  <div className="text-slate-300">{'pickle.dump(rf, open(\'model/stress_rf_model.pkl\', \'wb\'))'}</div>
                  <div className="text-slate-300">{'pickle.dump(scaler, open(\'model/scaler.pkl\', \'wb\'))'}</div>
                </div>
              </div>

              {/* Dataset sample */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span>📄</span> Dataset Format (CSV Sample)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr>
                        {['id', 'stress_emotional', 'sleep_quality', 'academic_pressure', 'social_interaction', 'physical_activity', 'stress_level'].map(h => (
                          <th key={h} className="text-left py-2 px-3 bg-white/10 text-violet-300 border-b border-white/10 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['001', '2', '4', '2', '4', '3', 'Low'],
                        ['002', '4', '2', '5', '2', '1', 'Severe'],
                        ['003', '3', '3', '3', '3', '3', 'Moderate'],
                        ['004', '5', '1', '4', '1', '2', 'Severe'],
                        ['005', '2', '5', '2', '5', '5', 'Low'],
                        ['006', '4', '2', '4', '2', '2', 'High'],
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className={`py-2 px-3 text-left ${
                              j === row.length - 1
                                ? cell === 'Severe' ? 'text-red-400' :
                                  cell === 'High' ? 'text-orange-400' :
                                  cell === 'Moderate' ? 'text-amber-400' : 'text-green-400'
                                : 'text-slate-300'
                            }`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  → Features 1–5: 1=Never/Low, 5=Always/High | Sleep & Social/Physical are inverted during preprocessing
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Restart CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={onRestart}
            className="flex items-center gap-2 mx-auto bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-medium px-6 py-3 rounded-xl transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Retake Assessment
          </button>
          <p className="text-xs text-slate-600 mt-3">
            MindEase – Student Stress Detection & Relief System | ML + LLM Architecture
          </p>
        </motion.div>
      </div>
    </div>
  );
}
