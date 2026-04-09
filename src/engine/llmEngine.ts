/**
 * ════════════════════════════════════════════════════════════════
 *  LLM ENGINE – Simulated GPT-4o powered adaptive questioning
 *  and personalized recommendations.
 *
 *  In production: replace fetch calls with real OpenAI API:
 *
 *  const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *    method: 'POST',
 *    headers: {
 *      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
 *      'Content-Type': 'application/json',
 *    },
 *    body: JSON.stringify({
 *      model: 'gpt-4o',
 *      messages: [
 *        { role: 'system', content: SYSTEM_PROMPT },
 *        { role: 'user',   content: buildUserPrompt(context) },
 *      ],
 *      temperature: 0.7,
 *      response_format: { type: 'json_object' },
 *    }),
 *  });
 * ════════════════════════════════════════════════════════════════
 */

import { FeatureCategory, PredictionResult, Recommendation, StressLevel } from '../types';
import { QUESTION_BANK } from '../data/questions';

// ──────────────────────────────────────────────────────────────
//  PROMPT TEMPLATES (ready for real LLM integration)
// ──────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_QUESTION_GEN = `
You are an empathetic AI counselor helping students assess their stress levels.
Your job is to generate ONE adaptive question at a time that maps to exactly ONE
of these feature categories:
  - stress_emotional
  - sleep_quality
  - academic_pressure
  - social_interaction
  - physical_activity

Rules:
1. Ask only ONE question per response
2. Keep questions conversational and non-clinical
3. Vary wording each time; never repeat a question
4. Avoid medical or diagnostic language
5. Questions should be answerable on a 5-point frequency scale

Output MUST be valid JSON:
{
  "question": "...",
  "category": "sleep_quality"
}
`.trim();

export const buildQuestionPrompt = (
  usedCategories: FeatureCategory[],
  previousAnswers: string[]
) => `
Previously asked categories: ${usedCategories.join(', ')}
Previous answers summary: ${previousAnswers.slice(-3).join(' | ')}

Generate a new question for a category NOT in the used list.
Return only the JSON object.
`.trim();

export const SYSTEM_PROMPT_RECOMMENDATIONS = `
You are a compassionate wellness advisor for college students.
Given a student's stress profile, generate 6 personalized, actionable daily-life
stress relief suggestions.

Rules:
1. NO medical advice whatsoever
2. Keep suggestions practical (doable today)
3. Each suggestion should target a specific issue
4. Be warm, encouraging, and non-judgmental
5. Keep each suggestion under 60 words

Output MUST be valid JSON array:
[
  {
    "id": 1,
    "category": "Sleep",
    "title": "Short title",
    "description": "Actionable tip",
    "icon": "🌙",
    "priority": "high"
  }
]
`.trim();

export const buildRecommendationPrompt = (result: PredictionResult): string => `
Student Stress Profile:
- Stress Level: ${result.stress_level}
- Confidence: ${Math.round(result.confidence * 100)}%
- Emotional Stress Score: ${result.features.stress_emotional}/5
- Sleep Quality Score: ${result.features.sleep_quality}/5 (1=good, 5=poor)
- Academic Pressure Score: ${result.features.academic_pressure}/5
- Social Interaction Score: ${result.features.social_interaction}/5 (1=isolated, 5=connected)
- Physical Activity Score: ${result.features.physical_activity}/5 (1=sedentary, 5=active)
- Main Issue: ${result.dominant_issue}

Generate 6 personalized recommendations targeting their specific issues.
`.trim();

// ──────────────────────────────────────────────────────────────
//  Adaptive Question Selector (simulates LLM output)
// ──────────────────────────────────────────────────────────────

const CATEGORY_ORDER: FeatureCategory[] = [
  'stress_emotional',
  'sleep_quality',
  'academic_pressure',
  'social_interaction',
  'physical_activity',
];

export function selectNextQuestion(
  usedCategories: FeatureCategory[],
  usedQuestionIds: string[]
): { question: typeof QUESTION_BANK[0]; isLLMVariant: boolean } | null {
  // Find next uncovered category
  const remainingCategories = CATEGORY_ORDER.filter(c => !usedCategories.includes(c));
  if (remainingCategories.length === 0) return null;

  // Pick the first remaining category
  const targetCategory = remainingCategories[0];

  // Pick a random unused question from that category
  const candidateQuestions = QUESTION_BANK.filter(
    q => q.category === targetCategory && !usedQuestionIds.includes(q.id)
  );

  if (candidateQuestions.length === 0) return null;

  // Randomize for variety
  const question = candidateQuestions[Math.floor(Math.random() * candidateQuestions.length)];
  return { question, isLLMVariant: false };
}

// ──────────────────────────────────────────────────────────────
//  Recommendation Generator (LLM simulation)
// ──────────────────────────────────────────────────────────────

interface RecommendationTemplate {
  condition: (r: PredictionResult) => boolean;
  recs: Omit<Recommendation, 'id'>[];
}

const RECOMMENDATION_LIBRARY: RecommendationTemplate[] = [
  // ── HIGH EMOTIONAL STRESS ───────────────────────────────────
  {
    condition: r => r.features.stress_emotional >= 4,
    recs: [
      {
        category: 'Mindfulness',
        title: '5-Minute Box Breathing',
        description: 'Try box breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times whenever you feel overwhelmed. This activates your parasympathetic nervous system and calms emotional surges within minutes.',
        icon: '🧘',
        priority: 'high',
      },
      {
        category: 'Journaling',
        title: 'Brain Dump Journaling',
        description: 'Spend 10 minutes writing every thought racing through your mind without editing. This "brain dump" reduces cognitive load and helps externalize internal chaos, making problems feel more manageable and less intimidating.',
        icon: '📝',
        priority: 'high',
      },
    ],
  },
  // ── POOR SLEEP ───────────────────────────────────────────────
  {
    condition: r => r.features.sleep_quality >= 4,
    recs: [
      {
        category: 'Sleep Hygiene',
        title: 'Digital Sunset Rule',
        description: 'Power down all screens 45 minutes before bed. The blue light from phones and laptops suppresses melatonin production. Replace this time with light reading, stretching, or a warm shower to signal your brain that sleep is coming.',
        icon: '🌙',
        priority: 'high',
      },
      {
        category: 'Sleep Hygiene',
        title: 'Fixed Sleep Schedule',
        description: 'Set a consistent bedtime and wake time — even on weekends. Your circadian rhythm thrives on consistency. Within 7 days you\'ll notice falling asleep faster and waking up naturally feeling more energized and focused.',
        icon: '⏰',
        priority: 'high',
      },
    ],
  },
  // ── HIGH ACADEMIC PRESSURE ────────────────────────────────────
  {
    condition: r => r.features.academic_pressure >= 4,
    recs: [
      {
        category: 'Study Strategy',
        title: 'Pomodoro Technique',
        description: 'Work in 25-minute focused sprints followed by 5-minute breaks. After 4 sprints, take a 20-minute break. This prevents burnout, improves focus quality, and makes huge study tasks feel structured and achievable.',
        icon: '🍅',
        priority: 'high',
      },
      {
        category: 'Planning',
        title: 'Priority Matrix Planning',
        description: 'Each Sunday, list all tasks and categorize them as Urgent/Important, Not Urgent/Important, Urgent/Not Important, and Neither. Focus only on the first two quadrants. This clarity prevents the panic of feeling behind on everything.',
        icon: '📊',
        priority: 'medium',
      },
    ],
  },
  // ── LOW SOCIAL INTERACTION ────────────────────────────────────
  {
    condition: r => r.features.social_interaction >= 4,
    recs: [
      {
        category: 'Social Connection',
        title: 'One Real Conversation Daily',
        description: 'Commit to one genuine, phone-free conversation with a friend, classmate, or family member each day — even 10 minutes counts. Human connection is one of the most powerful stress buffers; don\'t wait until you feel ready.',
        icon: '🤝',
        priority: 'high',
      },
      {
        category: 'Community',
        title: 'Join One Campus Activity',
        description: 'Find one club, study group, sports team, or volunteer activity that meets weekly. Belonging to a group creates identity, purpose, and social support — all proven to significantly reduce stress and loneliness.',
        icon: '🎯',
        priority: 'medium',
      },
    ],
  },
  // ── LOW PHYSICAL ACTIVITY ─────────────────────────────────────
  {
    condition: r => r.features.physical_activity >= 4,
    recs: [
      {
        category: 'Movement',
        title: '20-Minute Walk After Meals',
        description: 'A 20-minute walk after lunch or dinner releases endorphins, stabilizes blood sugar, and clears mental fog. You don\'t need a gym — just walking consistently can reduce cortisol (the stress hormone) by up to 26%.',
        icon: '🚶',
        priority: 'high',
      },
      {
        category: 'Exercise',
        title: 'Morning Stretching Routine',
        description: 'Do 5-10 minutes of full-body stretching every morning before reaching for your phone. This improves blood circulation, reduces physical tension stored from stress, and sets a calm, intentional tone for the entire day.',
        icon: '🧗',
        priority: 'medium',
      },
    ],
  },
  // ── UNIVERSAL (always shown) ───────────────────────────────────
  {
    condition: () => true,
    recs: [
      {
        category: 'Nutrition',
        title: 'Hydrate & Eat Regularly',
        description: 'Drink at least 8 glasses of water daily and eat regular meals without skipping. Dehydration and blood sugar dips significantly amplify stress responses. Keep a water bottle on your desk as a constant visual reminder.',
        icon: '💧',
        priority: 'medium',
      },
      {
        category: 'Mindfulness',
        title: 'Gratitude Practice',
        description: 'Before sleep, write down 3 specific things you are grateful for from that day. Research shows this simple practice rewires the brain toward positivity over 4-6 weeks, reducing stress and improving sleep quality naturally.',
        icon: '🙏',
        priority: 'low',
      },
      {
        category: 'Rest',
        title: 'Micro-Breaks Throughout the Day',
        description: 'Every 90 minutes, step away from your work for 5 minutes. Look out a window, do a short breathing exercise, or simply sit quietly. These micro-resets prevent mental exhaustion accumulation and maintain your focus throughout the day.',
        icon: '☕',
        priority: 'low',
      },
    ],
  },
];

const SEVERE_RECS: Recommendation[] = [
  {
    id: 99,
    category: 'Professional Support',
    title: 'Talk to Someone You Trust',
    description: 'When stress feels consistently overwhelming, reaching out to a trusted person — friend, family member, or campus counselor — can provide perspective and relief. You don\'t have to carry this alone. Seeking support is a strength, not a weakness.',
    icon: '💬',
    priority: 'high',
  },
];

export function generateRecommendations(result: PredictionResult): Recommendation[] {
  const collected: Omit<Recommendation, 'id'>[] = [];

  for (const template of RECOMMENDATION_LIBRARY) {
    if (template.condition(result)) {
      collected.push(...template.recs);
    }
  }

  // Deduplicate and limit to 6
  const seen = new Set<string>();
  const unique = collected.filter(r => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  unique.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const final = unique.slice(0, 6).map((r, i) => ({ ...r, id: i + 1 }));

  // Add severe-specific rec
  if (result.stress_level === 'Severe') {
    final.unshift(SEVERE_RECS[0]);
    final.splice(6);
  }

  return final;
}

// ──────────────────────────────────────────────────────────────
//  Stress Level Meta
// ──────────────────────────────────────────────────────────────

export const STRESS_LEVEL_META: Record<StressLevel, {
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  gradient: string;
  emoji: string;
  description: string;
  advice: string;
}> = {
  Low: {
    color: '#22c55e',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-700',
    gradient: 'from-green-400 to-emerald-500',
    emoji: '😊',
    description: 'You\'re managing stress well! Your current habits and coping strategies are working effectively.',
    advice: 'Keep maintaining your healthy routines and continue building resilience.',
  },
  Moderate: {
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-700',
    gradient: 'from-amber-400 to-orange-500',
    emoji: '😐',
    description: 'You\'re experiencing a manageable level of stress with some areas that need attention.',
    advice: 'Small consistent changes in your daily routine can significantly improve your wellbeing.',
  },
  High: {
    color: '#f97316',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-700',
    gradient: 'from-orange-400 to-red-500',
    emoji: '😔',
    description: 'Your stress level is notably elevated and is likely affecting your daily performance and wellbeing.',
    advice: 'It\'s important to take action now. Focus on the top recommendations below.',
  },
  Severe: {
    color: '#ef4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    textColor: 'text-red-700',
    gradient: 'from-red-500 to-rose-600',
    emoji: '😩',
    description: 'You\'re under severe stress. This level significantly impacts your health, focus, and relationships.',
    advice: 'Please prioritize self-care immediately and consider reaching out for additional support.',
  },
};
