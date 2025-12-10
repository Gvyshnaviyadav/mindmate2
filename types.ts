export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  VISION = 'VISION',
  RELAXATION = 'RELAXATION'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface WellnessMetric {
  name: string;
  score: number;
  delta: number; // Percentage change
}

export interface MoodLog {
  day: string;
  score: number;
  journal?: string;
}

export interface AIConfig {
  apiKey: string;
}
