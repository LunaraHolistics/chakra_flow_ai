/**
 * Chakra Flow - Regras e Cálculos Bioenergéticos
 * Fonte de verdade para o motor de pontuação e harmonização energética.
 */

export const EQUILIBRIUM_THRESHOLD = 65;

export type ChakraKey =
  | 'basico'
  | 'sacral'
  | 'plexoSolar'
  | 'cardiaco'
  | 'laringeo'
  | 'frontal'
  | 'coronario'
  | 'esplenico';

export interface ChakraScores {
  basico: number;
  sacral: number;
  plexoSolar: number;
  cardiaco: number;
  laringeo: number;
  frontal: number;
  coronario: number;
  esplenico: number;
}

export interface ChakraMetadata {
  key: ChakraKey;
  order: number;
  name: string;
  sanskritName: string;
  color: string;
  element: string;
  mantra: string;
  crystals: string;
  meaning: string;
  role: string;
  influence: string;
  signsOfImbalance: string;
  harmonizingPractices: string;
  affirmation: string;
}

export function isBalanced(score: number): boolean {
  return score >= EQUILIBRIUM_THRESHOLD;
}

export function getStatusLabel(score: number): 'Equilibrado' | 'Precisa de atenção' {
  return score >= EQUILIBRIUM_THRESHOLD ? 'Equilibrado' : 'Precisa de atenção';
}

export function calculateOverallScore(scores: ChakraScores): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / values.length);
}

export function countAttentionNeeded(scores: ChakraScores): number {
  return Object.values(scores).filter((val) => val < EQUILIBRIUM_THRESHOLD).length;
}

export function getChakrasNeedingAttention(scores: ChakraScores): ChakraKey[] {
  const keys: ChakraKey[] = [
    'basico',
    'sacral',
    'plexoSolar',
    'cardiaco',
    'laringeo',
    'frontal',
    'coronario',
    'esplenico',
  ];
  return keys.filter((key) => scores[key] < EQUILIBRIUM_THRESHOLD);
}

export function calculateScoreDelta(current: number, previous?: number): { delta: number; formatted: string } {
  if (previous === undefined || previous === null) {
    return { delta: 0, formatted: 'Primeira análise' };
  }
  const diff = current - previous;
  if (diff > 0) return { delta: diff, formatted: `+${diff}%` };
  if (diff < 0) return { delta: diff, formatted: `${diff}%` };
  return { delta: 0, formatted: 'Estável' };
}
