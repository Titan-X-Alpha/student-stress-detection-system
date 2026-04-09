import { useState, useCallback } from 'react';
import { AppPhase, UserAnswer, PredictionResult, Recommendation, StressFeatures, FeatureCategory } from './types';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import AnalyzingScreen from './components/AnalyzingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import DocumentationPage from './components/DocumentationPage';
import { predictStress } from './engine/mlModel';
import { generateRecommendations } from './engine/llmEngine';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('landing');
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleStart = useCallback(() => {
    setPhase('questionnaire');
    setAnswers([]);
    setPredictionResult(null);
    setRecommendations([]);
  }, []);

  const handleQuestionsComplete = useCallback((completedAnswers: UserAnswer[]) => {
    setAnswers(completedAnswers);
    setPhase('analyzing');
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    // Build feature vector from answers
    const featureMap: Partial<StressFeatures> = {};
    for (const answer of answers) {
      featureMap[answer.category as FeatureCategory] = answer.score;
    }

    // Fill in any missing features with neutral score (3)
    const features: StressFeatures = {
      stress_emotional:   featureMap.stress_emotional   ?? 3,
      sleep_quality:      featureMap.sleep_quality      ?? 3,
      academic_pressure:  featureMap.academic_pressure  ?? 3,
      social_interaction: featureMap.social_interaction ?? 3,
      physical_activity:  featureMap.physical_activity  ?? 3,
    };

    // Run ML model
    const result = predictStress(features);
    setPredictionResult(result);

    // Generate LLM recommendations
    const recs = generateRecommendations(result);
    setRecommendations(recs);

    setPhase('results');
  }, [answers]);

  const handleRestart = useCallback(() => {
    setPhase('landing');
    setAnswers([]);
    setPredictionResult(null);
    setRecommendations([]);
  }, []);

  const handleDocs = useCallback(() => {
    setPhase('documentation');
  }, []);

  switch (phase) {
    case 'landing':
      return <LandingPage onStart={handleStart} onDocs={handleDocs} />;

    case 'questionnaire':
      return <ChatInterface onComplete={handleQuestionsComplete} />;

    case 'analyzing':
      return <AnalyzingScreen onComplete={handleAnalysisComplete} />;

    case 'results':
      if (!predictionResult) return null;
      return (
        <ResultsDashboard
          result={predictionResult}
          recommendations={recommendations}
          answers={answers}
          onRestart={handleRestart}
        />
      );

    case 'documentation':
      return <DocumentationPage onBack={handleRestart} onStart={handleStart} />;

    default:
      return <LandingPage onStart={handleStart} onDocs={handleDocs} />;
  }
}
