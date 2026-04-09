import { Question, AnswerOption } from '../types';

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: 'Never', value: 1, emoji: '😊' },
  { label: 'Rarely', value: 2, emoji: '🙂' },
  { label: 'Sometimes', value: 3, emoji: '😐' },
  { label: 'Often', value: 4, emoji: '😔' },
  { label: 'Always', value: 5, emoji: '😩' },
];

// Inverse options (for positive questions like sleep quality / social interaction)
export const INVERSE_ANSWER_OPTIONS: AnswerOption[] = [
  { label: 'Never', value: 5, emoji: '😩' },
  { label: 'Rarely', value: 4, emoji: '😔' },
  { label: 'Sometimes', value: 3, emoji: '😐' },
  { label: 'Often', value: 2, emoji: '🙂' },
  { label: 'Always', value: 1, emoji: '😊' },
];

// Question bank - 3 questions per category
export const QUESTION_BANK: Question[] = [
  // ── STRESS_EMOTIONAL ──────────────────────────────────────────
  {
    id: 'se_1',
    question: 'How often do you feel overwhelmed by your emotions or daily situations?',
    category: 'stress_emotional',
    options: ANSWER_OPTIONS,
  },
  {
    id: 'se_2',
    question: 'How frequently do you experience feelings of anxiety or nervousness throughout the day?',
    category: 'stress_emotional',
    options: ANSWER_OPTIONS,
  },
  {
    id: 'se_3',
    question: 'How often do you find it hard to calm yourself down after something stressful happens?',
    category: 'stress_emotional',
    options: ANSWER_OPTIONS,
  },

  // ── SLEEP_QUALITY ─────────────────────────────────────────────
  {
    id: 'sq_1',
    question: 'How often do you wake up feeling fully rested and refreshed after a night\'s sleep?',
    category: 'sleep_quality',
    options: INVERSE_ANSWER_OPTIONS,
  },
  {
    id: 'sq_2',
    question: 'How frequently do you have trouble falling asleep or staying asleep at night?',
    category: 'sleep_quality',
    options: ANSWER_OPTIONS,
  },
  {
    id: 'sq_3',
    question: 'How often do you feel drowsy or exhausted during daytime activities?',
    category: 'sleep_quality',
    options: ANSWER_OPTIONS,
  },

  // ── ACADEMIC_PRESSURE ─────────────────────────────────────────
  {
    id: 'ap_1',
    question: 'How often do you feel overwhelmed by your assignments, exams, or study workload?',
    category: 'academic_pressure',
    options: ANSWER_OPTIONS,
  },
  {
    id: 'ap_2',
    question: 'How frequently do deadlines or upcoming tests cause you significant worry?',
    category: 'academic_pressure',
    options: ANSWER_OPTIONS,
  },
  {
    id: 'ap_3',
    question: 'How often does the pressure to perform well academically affect your mood?',
    category: 'academic_pressure',
    options: ANSWER_OPTIONS,
  },

  // ── SOCIAL_INTERACTION ────────────────────────────────────────
  {
    id: 'si_1',
    question: 'How often do you feel supported and connected with your friends, family, or peers?',
    category: 'social_interaction',
    options: INVERSE_ANSWER_OPTIONS,
  },
  {
    id: 'si_2',
    question: 'How frequently do you feel isolated or alone, even when surrounded by others?',
    category: 'social_interaction',
    options: ANSWER_OPTIONS,
  },
  {
    id: 'si_3',
    question: 'How often do social situations make you feel anxious or uncomfortable?',
    category: 'social_interaction',
    options: ANSWER_OPTIONS,
  },

  // ── PHYSICAL_ACTIVITY ─────────────────────────────────────────
  {
    id: 'pa_1',
    question: 'How often do you engage in physical activity such as walking, exercise, or sports?',
    category: 'physical_activity',
    options: INVERSE_ANSWER_OPTIONS,
  },
  {
    id: 'pa_2',
    question: 'How frequently do you spend extended periods sitting without any physical movement?',
    category: 'physical_activity',
    options: ANSWER_OPTIONS,
  },
  {
    id: 'pa_3',
    question: 'How often do you feel physically drained or lacking energy for basic activities?',
    category: 'physical_activity',
    options: ANSWER_OPTIONS,
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  stress_emotional: 'Emotional Wellbeing',
  sleep_quality: 'Sleep Quality',
  academic_pressure: 'Academic Pressure',
  social_interaction: 'Social Interaction',
  physical_activity: 'Physical Activity',
};

export const CATEGORY_COLORS: Record<string, string> = {
  stress_emotional: '#f97316',
  sleep_quality: '#8b5cf6',
  academic_pressure: '#ef4444',
  social_interaction: '#06b6d4',
  physical_activity: '#22c55e',
};

export const CATEGORY_ICONS: Record<string, string> = {
  stress_emotional: '🧠',
  sleep_quality: '🌙',
  academic_pressure: '📚',
  social_interaction: '🤝',
  physical_activity: '🏃',
};
