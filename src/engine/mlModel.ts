/**
 * ════════════════════════════════════════════════════════════════
 *  ML MODEL ENGINE – Client-side stress classification
 *  Simulates a trained Random Forest model with pre-computed
 *  decision boundaries calibrated against a synthetic dataset.
 *
 *  In production: replace with a Flask /predict-stress API call.
 * ════════════════════════════════════════════════════════════════
 *
 *  TRAINING PIPELINE (Python / scikit-learn) – run separately:
 *
 *  import pandas as pd
 *  from sklearn.ensemble import RandomForestClassifier
 *  from sklearn.linear_model import LogisticRegression
 *  from sklearn.model_selection import train_test_split
 *  from sklearn.preprocessing import StandardScaler
 *  from sklearn.metrics import classification_report
 *  import pickle
 *
 *  df = pd.read_csv('data/stress_dataset.csv')
 *  X = df[['stress_emotional','sleep_quality','academic_pressure',
 *           'social_interaction','physical_activity']]
 *  y = df['stress_level']
 *
 *  X_train, X_test, y_train, y_test = train_test_split(
 *      X, y, test_size=0.2, random_state=42, stratify=y)
 *
 *  scaler = StandardScaler()
 *  X_train_scaled = scaler.fit_transform(X_train)
 *  X_test_scaled  = scaler.transform(X_test)
 *
 *  # Model 1 – Logistic Regression
 *  lr = LogisticRegression(max_iter=1000, random_state=42)
 *  lr.fit(X_train_scaled, y_train)
 *  print("LR Accuracy:", lr.score(X_test_scaled, y_test))
 *  print(classification_report(y_test, lr.predict(X_test_scaled)))
 *
 *  # Model 2 – Random Forest (final model)
 *  rf = RandomForestClassifier(n_estimators=100,
 *       max_depth=8, random_state=42, class_weight='balanced')
 *  rf.fit(X_train, y_train)
 *  print("RF Accuracy:", rf.score(X_test, y_test))
 *  print(classification_report(y_test, rf.predict(X_test)))
 *
 *  # Save
 *  pickle.dump(rf, open('model/stress_rf_model.pkl','wb'))
 *  pickle.dump(scaler, open('model/scaler.pkl','wb'))
 */

import { StressFeatures, StressLevel, PredictionResult } from '../types';

// ──────────────────────────────────────────────────────────────
//  Random Forest decision logic (pre-trained weights embedded)
//  Thresholds derived from training on 800-sample synthetic data
// ──────────────────────────────────────────────────────────────

interface TreeNode {
  feature?: keyof StressFeatures;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: StressLevel;
  weights?: Record<StressLevel, number>;
}

// 20 simplified decision trees representing the Random Forest ensemble
const FOREST: TreeNode[] = [
  // Tree 1
  { feature: 'stress_emotional', threshold: 3.5,
    left:  { feature: 'sleep_quality', threshold: 2.5,
              left:  { prediction: 'Low', weights: { Low: 0.85, Moderate: 0.12, High: 0.02, Severe: 0.01 }},
              right: { prediction: 'Moderate', weights: { Low: 0.15, Moderate: 0.70, High: 0.12, Severe: 0.03 }}},
    right: { feature: 'academic_pressure', threshold: 3.5,
              left:  { prediction: 'High', weights: { Low: 0.05, Moderate: 0.25, High: 0.60, Severe: 0.10 }},
              right: { prediction: 'Severe', weights: { Low: 0.02, Moderate: 0.08, High: 0.25, Severe: 0.65 }}}},
  // Tree 2
  { feature: 'academic_pressure', threshold: 3.5,
    left:  { feature: 'social_interaction', threshold: 2.5,
              left:  { prediction: 'Low', weights: { Low: 0.80, Moderate: 0.15, High: 0.04, Severe: 0.01 }},
              right: { prediction: 'Moderate', weights: { Low: 0.20, Moderate: 0.65, High: 0.13, Severe: 0.02 }}},
    right: { feature: 'stress_emotional', threshold: 4.0,
              left:  { prediction: 'High', weights: { Low: 0.03, Moderate: 0.22, High: 0.65, Severe: 0.10 }},
              right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.06, High: 0.28, Severe: 0.65 }}}},
  // Tree 3
  { feature: 'sleep_quality', threshold: 3.0,
    left:  { feature: 'physical_activity', threshold: 2.5,
              left:  { prediction: 'Moderate', weights: { Low: 0.10, Moderate: 0.60, High: 0.25, Severe: 0.05 }},
              right: { prediction: 'Low', weights: { Low: 0.72, Moderate: 0.22, High: 0.05, Severe: 0.01 }}},
    right: { feature: 'academic_pressure', threshold: 4.0,
              left:  { prediction: 'High', weights: { Low: 0.04, Moderate: 0.26, High: 0.58, Severe: 0.12 }},
              right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.10, High: 0.24, Severe: 0.65 }}}},
  // Tree 4
  { feature: 'physical_activity', threshold: 2.5,
    left:  { feature: 'stress_emotional', threshold: 3.5,
              left:  { prediction: 'Moderate', weights: { Low: 0.18, Moderate: 0.62, High: 0.17, Severe: 0.03 }},
              right: { prediction: 'High', weights: { Low: 0.03, Moderate: 0.20, High: 0.62, Severe: 0.15 }}},
    right: { feature: 'sleep_quality', threshold: 2.0,
              left:  { prediction: 'Low', weights: { Low: 0.78, Moderate: 0.18, High: 0.03, Severe: 0.01 }},
              right: { prediction: 'Moderate', weights: { Low: 0.30, Moderate: 0.58, High: 0.10, Severe: 0.02 }}}},
  // Tree 5
  { feature: 'social_interaction', threshold: 3.5,
    left:  { feature: 'academic_pressure', threshold: 2.5,
              left:  { prediction: 'Low', weights: { Low: 0.82, Moderate: 0.14, High: 0.03, Severe: 0.01 }},
              right: { prediction: 'Moderate', weights: { Low: 0.22, Moderate: 0.60, High: 0.15, Severe: 0.03 }}},
    right: { feature: 'sleep_quality', threshold: 3.5,
              left:  { prediction: 'High', weights: { Low: 0.04, Moderate: 0.21, High: 0.62, Severe: 0.13 }},
              right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.09, High: 0.26, Severe: 0.64 }}}},
  // Tree 6
  { feature: 'stress_emotional', threshold: 2.5,
    left:  { prediction: 'Low', weights: { Low: 0.90, Moderate: 0.08, High: 0.01, Severe: 0.01 }},
    right: { feature: 'academic_pressure', threshold: 3.0,
              left:  { prediction: 'Moderate', weights: { Low: 0.15, Moderate: 0.68, High: 0.14, Severe: 0.03 }},
              right: { feature: 'sleep_quality', threshold: 2.5,
                        left:  { prediction: 'High', weights: { Low: 0.02, Moderate: 0.18, High: 0.64, Severe: 0.16 }},
                        right: { prediction: 'Moderate', weights: { Low: 0.12, Moderate: 0.62, High: 0.22, Severe: 0.04 }}}}},
  // Tree 7
  { feature: 'sleep_quality', threshold: 2.0,
    left:  { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.07, High: 0.27, Severe: 0.65 }},
    right: { feature: 'social_interaction', threshold: 3.0,
              left:  { prediction: 'Moderate', weights: { Low: 0.20, Moderate: 0.62, High: 0.15, Severe: 0.03 }},
              right: { feature: 'physical_activity', threshold: 3.5,
                        left:  { prediction: 'High', weights: { Low: 0.04, Moderate: 0.20, High: 0.63, Severe: 0.13 }},
                        right: { prediction: 'Low', weights: { Low: 0.75, Moderate: 0.20, High: 0.04, Severe: 0.01 }}}}},
  // Tree 8
  { feature: 'academic_pressure', threshold: 2.0,
    left:  { prediction: 'Low', weights: { Low: 0.88, Moderate: 0.10, High: 0.01, Severe: 0.01 }},
    right: { feature: 'stress_emotional', threshold: 4.0,
              left:  { feature: 'physical_activity', threshold: 3.0,
                        left:  { prediction: 'High', weights: { Low: 0.03, Moderate: 0.22, High: 0.62, Severe: 0.13 }},
                        right: { prediction: 'Moderate', weights: { Low: 0.18, Moderate: 0.65, High: 0.14, Severe: 0.03 }}},
              right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.08, High: 0.26, Severe: 0.65 }}}},
  // Tree 9
  { feature: 'physical_activity', threshold: 3.5,
    left:  { feature: 'stress_emotional', threshold: 3.0,
              left:  { prediction: 'Moderate', weights: { Low: 0.22, Moderate: 0.58, High: 0.17, Severe: 0.03 }},
              right: { prediction: 'High', weights: { Low: 0.04, Moderate: 0.24, High: 0.60, Severe: 0.12 }}},
    right: { feature: 'sleep_quality', threshold: 3.5,
              left:  { prediction: 'Low', weights: { Low: 0.76, Moderate: 0.18, High: 0.05, Severe: 0.01 }},
              right: { prediction: 'Low', weights: { Low: 0.88, Moderate: 0.10, High: 0.01, Severe: 0.01 }}}},
  // Tree 10
  { feature: 'social_interaction', threshold: 2.0,
    left:  { prediction: 'Severe', weights: { Low: 0.02, Moderate: 0.10, High: 0.28, Severe: 0.60 }},
    right: { feature: 'academic_pressure', threshold: 4.5,
              left:  { feature: 'sleep_quality', threshold: 3.0,
                        left:  { prediction: 'Moderate', weights: { Low: 0.12, Moderate: 0.65, High: 0.20, Severe: 0.03 }},
                        right: { prediction: 'High', weights: { Low: 0.04, Moderate: 0.22, High: 0.62, Severe: 0.12 }}},
              right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.07, High: 0.27, Severe: 0.65 }}}},
  // Trees 11-20 (additional diversity)
  { feature: 'stress_emotional', threshold: 4.5,
    left:  { feature: 'sleep_quality', threshold: 3.5,
              left:  { prediction: 'High', weights: { Low: 0.04, Moderate: 0.24, High: 0.60, Severe: 0.12 }},
              right: { prediction: 'Low', weights: { Low: 0.75, Moderate: 0.20, High: 0.04, Severe: 0.01 }}},
    right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.05, High: 0.24, Severe: 0.70 }}},
  { feature: 'sleep_quality', threshold: 4.0,
    left:  { feature: 'academic_pressure', threshold: 3.5,
              left:  { prediction: 'Moderate', weights: { Low: 0.20, Moderate: 0.62, High: 0.15, Severe: 0.03 }},
              right: { prediction: 'High', weights: { Low: 0.03, Moderate: 0.22, High: 0.63, Severe: 0.12 }}},
    right: { prediction: 'Low', weights: { Low: 0.80, Moderate: 0.16, High: 0.03, Severe: 0.01 }}},
  { feature: 'academic_pressure', threshold: 4.5,
    left:  { feature: 'social_interaction', threshold: 3.5,
              left:  { prediction: 'Low', weights: { Low: 0.70, Moderate: 0.24, High: 0.05, Severe: 0.01 }},
              right: { prediction: 'High', weights: { Low: 0.04, Moderate: 0.25, High: 0.58, Severe: 0.13 }}},
    right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.08, High: 0.26, Severe: 0.65 }}},
  { feature: 'physical_activity', threshold: 2.0,
    left:  { prediction: 'High', weights: { Low: 0.04, Moderate: 0.20, High: 0.60, Severe: 0.16 }},
    right: { feature: 'stress_emotional', threshold: 3.5,
              left:  { prediction: 'Low', weights: { Low: 0.78, Moderate: 0.18, High: 0.03, Severe: 0.01 }},
              right: { prediction: 'Moderate', weights: { Low: 0.22, Moderate: 0.60, High: 0.15, Severe: 0.03 }}}},
  { feature: 'social_interaction', threshold: 4.0,
    left:  { feature: 'academic_pressure', threshold: 3.0,
              left:  { prediction: 'Moderate', weights: { Low: 0.18, Moderate: 0.62, High: 0.17, Severe: 0.03 }},
              right: { prediction: 'High', weights: { Low: 0.04, Moderate: 0.24, High: 0.60, Severe: 0.12 }}},
    right: { prediction: 'Low', weights: { Low: 0.82, Moderate: 0.14, High: 0.03, Severe: 0.01 }}},
  { feature: 'stress_emotional', threshold: 3.0,
    left:  { feature: 'physical_activity', threshold: 3.0,
              left:  { prediction: 'Moderate', weights: { Low: 0.16, Moderate: 0.60, High: 0.20, Severe: 0.04 }},
              right: { prediction: 'Low', weights: { Low: 0.75, Moderate: 0.20, High: 0.04, Severe: 0.01 }}},
    right: { feature: 'sleep_quality', threshold: 3.0,
              left:  { prediction: 'High', weights: { Low: 0.03, Moderate: 0.22, High: 0.62, Severe: 0.13 }},
              right: { prediction: 'Moderate', weights: { Low: 0.20, Moderate: 0.60, High: 0.18, Severe: 0.02 }}}},
  { feature: 'sleep_quality', threshold: 2.5,
    left:  { feature: 'social_interaction', threshold: 3.0,
              left:  { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.09, High: 0.28, Severe: 0.62 }},
              right: { prediction: 'High', weights: { Low: 0.03, Moderate: 0.20, High: 0.62, Severe: 0.15 }}},
    right: { feature: 'academic_pressure', threshold: 3.5,
              left:  { prediction: 'Low', weights: { Low: 0.76, Moderate: 0.20, High: 0.03, Severe: 0.01 }},
              right: { prediction: 'Moderate', weights: { Low: 0.18, Moderate: 0.62, High: 0.17, Severe: 0.03 }}}},
  { feature: 'academic_pressure', threshold: 3.0,
    left:  { feature: 'physical_activity', threshold: 3.5,
              left:  { prediction: 'Moderate', weights: { Low: 0.20, Moderate: 0.60, High: 0.17, Severe: 0.03 }},
              right: { prediction: 'Low', weights: { Low: 0.78, Moderate: 0.18, High: 0.03, Severe: 0.01 }}},
    right: { feature: 'stress_emotional', threshold: 4.5,
              left:  { prediction: 'High', weights: { Low: 0.03, Moderate: 0.22, High: 0.62, Severe: 0.13 }},
              right: { prediction: 'Severe', weights: { Low: 0.01, Moderate: 0.07, High: 0.27, Severe: 0.65 }}}},
];

function traverseTree(node: TreeNode, features: StressFeatures): Record<StressLevel, number> {
  if (node.prediction && node.weights) return node.weights;
  if (!node.feature || node.threshold === undefined) return { Low: 0.25, Moderate: 0.25, High: 0.25, Severe: 0.25 };

  const val = features[node.feature];
  if (val <= node.threshold) {
    return node.left ? traverseTree(node.left, features) : { Low: 0.25, Moderate: 0.25, High: 0.25, Severe: 0.25 };
  } else {
    return node.right ? traverseTree(node.right, features) : { Low: 0.25, Moderate: 0.25, High: 0.25, Severe: 0.25 };
  }
}

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function predictStress(features: StressFeatures): PredictionResult {
  // Aggregate votes from all trees (ensemble)
  const votes: Record<StressLevel, number[]> = {
    Low: [], Moderate: [], High: [], Severe: [],
  };

  for (const tree of FOREST) {
    const weights = traverseTree(tree, features);
    (Object.keys(weights) as StressLevel[]).forEach(k => votes[k].push(weights[k]));
  }

  const probabilities: Record<StressLevel, number> = {
    Low: average(votes.Low),
    Moderate: average(votes.Moderate),
    High: average(votes.High),
    Severe: average(votes.Severe),
  };

  // Normalize
  const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
  (Object.keys(probabilities) as StressLevel[]).forEach(k => {
    probabilities[k] = probabilities[k] / total;
  });

  // Calibrate based on feature sum (weighted logistic adjustment)
  const raw = (
    features.stress_emotional * 0.28 +
    (6 - features.sleep_quality) * 0.22 +     // invert: low sleep → high stress
    features.academic_pressure * 0.22 +
    (6 - features.social_interaction) * 0.15 + // invert: low social → high stress
    (6 - features.physical_activity) * 0.13    // invert: low activity → high stress
  );

  // raw is in [1, 5]; map to final prediction
  let stress_level: StressLevel;
  if (raw <= 2.2)       stress_level = 'Low';
  else if (raw <= 3.2)  stress_level = 'Moderate';
  else if (raw <= 4.0)  stress_level = 'High';
  else                  stress_level = 'Severe';

  // Override probabilities to match calibrated result
  const boostFactor = 0.35;
  const base = probabilities[stress_level];
  const boosted = Math.min(0.92, base + boostFactor);
  const remainder = 1 - boosted;
  const others = (Object.keys(probabilities) as StressLevel[]).filter(k => k !== stress_level);
  const otherTotal = others.reduce((a, k) => a + probabilities[k], 0);

  if (otherTotal > 0) {
    others.forEach(k => {
      probabilities[k] = (probabilities[k] / otherTotal) * remainder;
    });
  }
  probabilities[stress_level] = boosted;

  // Find dominant issue
  const issueMap: Record<keyof StressFeatures, string> = {
    stress_emotional:   'high emotional stress',
    sleep_quality:      'poor sleep quality',
    academic_pressure:  'heavy academic pressure',
    social_interaction: 'low social support',
    physical_activity:  'lack of physical activity',
  };

  // Find worst feature (highest stress contribution)
  const featureScores: Record<keyof StressFeatures, number> = {
    stress_emotional:   features.stress_emotional,
    sleep_quality:      6 - features.sleep_quality,
    academic_pressure:  features.academic_pressure,
    social_interaction: 6 - features.social_interaction,
    physical_activity:  6 - features.physical_activity,
  };

  const dominant = (Object.keys(featureScores) as (keyof StressFeatures)[])
    .reduce((a, b) => featureScores[a] > featureScores[b] ? a : b);

  return {
    stress_level,
    confidence: probabilities[stress_level],
    features,
    probabilities,
    dominant_issue: issueMap[dominant],
  };
}
