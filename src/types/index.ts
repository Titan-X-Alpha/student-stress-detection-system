export interface StressFeatures {
  stress_emotional: number; // 1-5
  sleep_quality: number;    // 1-5
  academic_pressure: number;// 1-5
  social_interaction: number;// 1-5
  physical_activity: number; // 1-5
}

export type StressLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export type FeatureCategory =
  | 'stress_emotional'
  | 'sleep_quality'
  | 'academic_pressure'
  | 'social_interaction'
  | 'physical_activity';

export interface Question {
  id: string;
  question: string;
  category: FeatureCategory;
  options: AnswerOption[];
}

export interface AnswerOption {
  label: string;
  value: number;
  emoji: string;
}

export interface UserAnswer {
  questionId: string;
  category: FeatureCategory;
  question: string;
  answer: string;
  score: number;
}

export interface PredictionResult {
  stress_level: StressLevel;
  confidence: number;
  features: StressFeatures;
  probabilities: Record<StressLevel, number>;
  dominant_issue: string;
}

export interface Recommendation {
  id: number;
  category: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export type AppPhase =
  | 'landing'
  | 'intro'
  | 'questionnaire'
  | 'analyzing'
  | 'results'
  | 'documentation';

export interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  questionData?: Question;
  answerData?: UserAnswer;
}
