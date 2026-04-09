import { motion } from 'framer-motion';
import { Brain, ChevronLeft, ChevronRight, Server, Database, GitBranch, Zap } from 'lucide-react';

interface DocumentationPageProps {
  onBack: () => void;
  onStart: () => void;
}

const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
  >
    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
      <span>{icon}</span> {title}
    </h3>
    {children}
  </motion.div>
);

const Code = ({ children }: { children: string }) => (
  <pre className="bg-slate-950/60 border border-white/5 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
    {children}
  </pre>
);

export default function DocumentationPage({ onBack, onStart }: DocumentationPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">MindEase Documentation</span>
          </div>
          <button
            onClick={onStart}
            className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-colors"
          >
            Try It <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-300 mb-6">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Complete System Architecture
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Student Stress Detection & Relief System
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Full technical documentation covering ML pipeline, LLM integration, API design,
            dataset requirements, and deployment instructions.
          </p>
        </div>

        {/* Project Structure */}
        <Section title="Project Structure" icon="📁">
          <Code>{`/mindease-project
├── /frontend                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   ├── data/questions.ts   # Question bank (15 questions)
│   │   ├── engine/
│   │   │   ├── mlModel.ts      # RF classification engine
│   │   │   └── llmEngine.ts    # LLM prompts + rec generator
│   │   └── components/
│   │       ├── LandingPage.tsx
│   │       ├── ChatInterface.tsx
│   │       ├── AnalyzingScreen.tsx
│   │       ├── ResultsDashboard.tsx
│   │       └── DocumentationPage.tsx
│
├── /backend                   # Flask REST API
│   ├── app.py                 # Main Flask server
│   ├── requirements.txt
│   └── routes/
│       ├── questions.py        # /generate-question
│       ├── answers.py          # /submit-answer
│       ├── predict.py          # /predict-stress
│       └── recommendations.py # /get-recommendations
│
├── /model                     # ML artifacts
│   ├── stress_rf_model.pkl    # Trained Random Forest
│   ├── scaler.pkl             # StandardScaler
│   └── train_model.py         # Training script
│
└── /data
    ├── stress_dataset.csv      # 300–1000 student responses
    └── data_exploration.ipynb # EDA notebook`}
          </Code>
        </Section>

        {/* Dataset */}
        <Section title="Dataset Requirements" icon="📊">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Collection Method</h4>
              <p className="text-sm text-slate-400">
                Collect 300–1000 responses via Google Forms. Map form answers (Never/Rarely/Sometimes/Often/Always)
                to numerical scores (1–5). Manually label each response with stress_level based on total score.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">CSV Format</h4>
              <Code>{`id,stress_emotional,sleep_quality,academic_pressure,social_interaction,physical_activity,stress_level
001,2,4,2,4,3,Low
002,4,2,5,2,1,Severe
003,3,3,3,3,3,Moderate
004,5,1,4,1,2,Severe
005,2,5,2,5,5,Low
006,4,2,4,2,2,High
...`}
              </Code>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Labeling Rules</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { level: 'Low', range: '5–10', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                  { level: 'Moderate', range: '11–15', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                  { level: 'High', range: '16–20', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                  { level: 'Severe', range: '21–25', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                ].map(l => (
                  <div key={l.level} className={`${l.bg} border rounded-xl p-3 text-center`}>
                    <div className={`font-bold ${l.color}`}>{l.level}</div>
                    <div className="text-xs text-slate-400">Score: {l.range}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Preprocessing Steps</h4>
              <Code>{`# 1. Load and validate
df = pd.read_csv('data/stress_dataset.csv')
assert df.isnull().sum().sum() == 0, "No nulls allowed"
assert all(df[f].between(1, 5).all() for f in FEATURES)

# 2. Invert sleep_quality, social_interaction, physical_activity
#    (higher raw = better, but we need higher = more stress)
df['sleep_stress']    = 6 - df['sleep_quality']
df['social_stress']   = 6 - df['social_interaction']
df['physical_stress'] = 6 - df['physical_activity']

# 3. Feature scaling for Logistic Regression
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 4. Class balance check
print(df['stress_level'].value_counts())
# If imbalanced: use class_weight='balanced' in models`}
              </Code>
            </div>
          </div>
        </Section>

        {/* ML Model */}
        <Section title="Machine Learning Model" icon="🤖">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Model 1: Logistic Regression',
                  tag: 'Baseline',
                  color: 'border-blue-500/30 bg-blue-500/5',
                  points: [
                    'Multi-class (OvR strategy)',
                    'Requires StandardScaler',
                    'Fast training & inference',
                    'Expected accuracy: ~78–82%',
                  ],
                },
                {
                  title: 'Model 2: Random Forest',
                  tag: 'Final Model ✓',
                  color: 'border-green-500/30 bg-green-500/5',
                  points: [
                    '100 decision trees',
                    'No scaling required',
                    'Handles non-linearity',
                    'Expected accuracy: ~85–91%',
                  ],
                },
              ].map(m => (
                <div key={m.title} className={`border rounded-xl p-4 ${m.color}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">{m.title}</h4>
                    <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{m.tag}</span>
                  </div>
                  <ul className="space-y-1">
                    {m.points.map(p => (
                      <li key={p} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-violet-400">→</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Code>{`# Full training script
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score
import numpy as np

# Hyperparameter tuning
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [4, 6, 8, None],
    'min_samples_split': [2, 5, 10],
    'class_weight': ['balanced', None]
}

rf_base = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(rf_base, param_grid, cv=5,
                           scoring='f1_weighted', n_jobs=-1)
grid_search.fit(X_train, y_train)

best_rf = grid_search.best_estimator_
print("Best params:", grid_search.best_params_)
print("CV F1 Score:", grid_search.best_score_)

# Cross-validation
cv_scores = cross_val_score(best_rf, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {np.mean(cv_scores):.3f} ± {np.std(cv_scores):.3f}")

# Feature importance
for feat, imp in zip(FEATURES, best_rf.feature_importances_):
    print(f"  {feat}: {imp:.4f}")`}
            </Code>
          </div>
        </Section>

        {/* LLM Prompts */}
        <Section title="LLM Prompt Templates" icon="🧠">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">System Prompt: Question Generator</h4>
              <Code>{`SYSTEM_PROMPT_QUESTION_GEN = """
You are an empathetic AI counselor helping students assess their stress levels.
Your job is to generate ONE adaptive question at a time that maps to exactly ONE
of these feature categories:
  - stress_emotional    (feelings of anxiety, being overwhelmed)
  - sleep_quality       (sleep patterns, restfulness, insomnia)
  - academic_pressure   (study load, exam stress, deadlines)
  - social_interaction  (social support, loneliness, connection)
  - physical_activity   (exercise, movement, energy levels)

Rules:
1. Ask ONLY ONE question per response
2. Keep questions conversational and non-clinical
3. Vary wording; never repeat a question from the session
4. Avoid medical or diagnostic language
5. Questions must be answerable on a 5-point frequency scale
   (Never | Rarely | Sometimes | Often | Always)

Output MUST be valid JSON:
{
  "question": "How often do you find it difficult to fall asleep at night?",
  "category": "sleep_quality"
}
"""`}
              </Code>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">System Prompt: Recommendation Generator</h4>
              <Code>{`SYSTEM_PROMPT_RECOMMENDATIONS = """
You are a compassionate wellness advisor for college students.
Given a student's stress profile, generate 6 personalized, actionable
daily-life stress relief suggestions.

Rules:
1. NO medical advice whatsoever
2. Keep suggestions practical (doable today, no equipment needed)
3. Each suggestion should target a specific issue in their profile
4. Be warm, encouraging, and non-judgmental
5. Keep each suggestion under 60 words

Output MUST be valid JSON array:
[
  {
    "id": 1,
    "category": "Sleep",
    "title": "Digital Sunset Rule",
    "description": "Power down screens 45 minutes before bed...",
    "icon": "🌙",
    "priority": "high"
  },
  ...
]
"""`}
              </Code>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">User Prompt: Recommendations</h4>
              <Code>{`def build_recommendation_prompt(result):
    return f"""
Student Stress Profile:
- Stress Level: {result['stress_level']}
- Confidence: {result['confidence']:.0%}
- Emotional Stress: {result['features']['stress_emotional']}/5
- Sleep Quality: {result['features']['sleep_quality']}/5
- Academic Pressure: {result['features']['academic_pressure']}/5
- Social Interaction: {result['features']['social_interaction']}/5
- Physical Activity: {result['features']['physical_activity']}/5
- Main Issue: {result['dominant_issue']}

Generate 6 highly personalized recommendations targeting
their specific high-stress dimensions. Prioritize the areas
with the highest stress scores.
"""`}
              </Code>
            </div>
          </div>
        </Section>

        {/* Flask Backend */}
        <Section title="Flask Backend (Python)" icon="🐍">
          <Code>{`# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import openai
import json
import uuid

app = Flask(__name__)
CORS(app)

# Load trained model
rf_model = pickle.load(open('model/stress_rf_model.pkl', 'rb'))
scaler   = pickle.load(open('model/scaler.pkl', 'rb'))

FEATURES = ['stress_emotional','sleep_quality','academic_pressure',
            'social_interaction','physical_activity']

sessions = {}  # In production: use Redis

# ── API 1: Generate Question ──────────────────────────────────
@app.route('/generate-question', methods=['POST'])
def generate_question():
    data = request.json
    session_id = data.get('session_id', str(uuid.uuid4()))
    used_categories = data.get('used_categories', [])

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_QUESTION_GEN},
            {"role": "user",   "content": f"Used: {used_categories}. Generate next question."}
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    result = json.loads(response.choices[0].message.content)
    return jsonify({"session_id": session_id, **result})

# ── API 2: Submit Answer ──────────────────────────────────────
SCORE_MAP = {"Never":1,"Rarely":2,"Sometimes":3,"Often":4,"Always":5}

@app.route('/submit-answer', methods=['POST'])
def submit_answer():
    data = request.json
    session_id = data['session_id']
    category   = data['category']
    answer     = data['answer']
    score      = SCORE_MAP.get(answer, 3)

    if session_id not in sessions:
        sessions[session_id] = {}
    sessions[session_id][category] = score

    return jsonify({"score": score, "category": category,
                    "collected": len(sessions[session_id])})

# ── API 3: Predict Stress ─────────────────────────────────────
@app.route('/predict-stress', methods=['POST'])
def predict_stress():
    data = request.json
    features = data.get('features', {})
    X = np.array([[features[f] for f in FEATURES]])

    prediction   = rf_model.predict(X)[0]
    probabilities = dict(zip(rf_model.classes_,
                             rf_model.predict_proba(X)[0].tolist()))
    confidence   = float(max(rf_model.predict_proba(X)[0]))

    return jsonify({
        "stress_level":   prediction,
        "confidence":     confidence,
        "probabilities":  probabilities,
        "features":       features,
    })

# ── API 4: Get Recommendations ────────────────────────────────
@app.route('/get-recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    prompt = build_recommendation_prompt(data)

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT_RECOMMENDATIONS},
            {"role": "user",   "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.6,
    )
    recs = json.loads(response.choices[0].message.content)
    return jsonify(recs)

if __name__ == '__main__':
    app.run(debug=True, port=5000)`}
          </Code>
        </Section>

        {/* Setup Instructions */}
        <Section title="Setup Instructions" icon="🚀">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Server className="w-4 h-4" /> Backend Setup
              </h4>
              <Code>{`# 1. Create virtual environment
python -m venv venv && source venv/bin/activate

# 2. Install dependencies
pip install flask flask-cors scikit-learn pandas numpy openai pickle5

# 3. Set OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# 4. Train the model
python model/train_model.py

# 5. Start Flask server
python backend/app.py
# → Running on http://localhost:5000`}
              </Code>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> Frontend Setup
              </h4>
              <Code>{`# 1. Install Node.js dependencies
npm install

# 2. Start development server
npm run dev
# → Running on http://localhost:5173

# 3. Build for production
npm run build`}
              </Code>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" /> Requirements File
              </h4>
              <Code>{`# backend/requirements.txt
flask==3.0.0
flask-cors==4.0.0
scikit-learn==1.4.0
pandas==2.2.0
numpy==1.26.0
openai==1.12.0
python-dotenv==1.0.0`}
              </Code>
            </div>
          </div>
        </Section>

        {/* API Examples */}
        <Section title="API Request/Response Examples" icon="🔌">
          <div className="space-y-4">
            {[
              {
                title: 'POST /generate-question',
                req: `{
  "session_id": "abc123",
  "used_categories": ["stress_emotional"]
}`,
                res: `{
  "session_id": "abc123",
  "question": "How often do you feel drowsy during class?",
  "category": "sleep_quality"
}`,
              },
              {
                title: 'POST /predict-stress',
                req: `{
  "features": {
    "stress_emotional": 4,
    "sleep_quality": 2,
    "academic_pressure": 5,
    "social_interaction": 2,
    "physical_activity": 1
  }
}`,
                res: `{
  "stress_level": "Severe",
  "confidence": 0.847,
  "probabilities": {
    "Low": 0.021,
    "Moderate": 0.068,
    "High": 0.244,
    "Severe": 0.667
  }
}`,
              },
            ].map((ex, i) => (
              <div key={i} className="bg-slate-950/50 border border-white/5 rounded-xl overflow-hidden">
                <div className="bg-white/5 border-b border-white/5 px-4 py-2">
                  <span className="text-xs font-mono font-semibold text-violet-300">{ex.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-2 font-semibold">REQUEST BODY</div>
                    <pre className="text-xs font-mono text-slate-300">{ex.req}</pre>
                  </div>
                  <div>
                    <div className="text-xs text-green-500 mb-2 font-semibold">RESPONSE (200 OK)</div>
                    <pre className="text-xs font-mono text-green-400">{ex.res}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div className="text-center mt-12 bg-gradient-to-br from-violet-900/40 to-purple-900/40 border border-violet-500/20 rounded-3xl p-10">
          <div className="text-4xl mb-3">🎓</div>
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Experience It Live?</h3>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            The full working demo is running right now in your browser.
            Click below to start your stress assessment.
          </p>
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-xl shadow-purple-500/25 transition-all"
          >
            Start Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
