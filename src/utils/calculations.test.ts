import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isBalanced,
  getStatusLabel,
  calculateOverallScore,
  countAttentionNeeded,
  getChakrasNeedingAttention,
  calculateScoreDelta,
  ChakraScores,
} from './calculations';

test('isBalanced correctly classifies scores at and above 65%', () => {
  assert.equal(isBalanced(65), true);
  assert.equal(isBalanced(80), true);
  assert.equal(isBalanced(100), true);
  assert.equal(isBalanced(64), false);
  assert.equal(isBalanced(0), false);
});

test('getStatusLabel returns exact required Portuguese labels', () => {
  assert.equal(getStatusLabel(65), 'Equilibrado');
  assert.equal(getStatusLabel(64), 'Precisa de atenção');
});

test('calculateOverallScore computes the rounded arithmetic mean of 8 chakras', () => {
  const sampleScores: ChakraScores = {
    basico: 82,
    sacral: 74,
    plexoSolar: 58,
    cardiaco: 86,
    laringeo: 52,
    frontal: 78,
    coronario: 85,
    esplenico: 80,
  };
  // sum = 82 + 74 + 58 + 86 + 52 + 78 + 85 + 80 = 595
  // 595 / 8 = 74.375 -> rounded = 74
  assert.equal(calculateOverallScore(sampleScores), 74);
});

test('countAttentionNeeded counts how many chakras are strictly below 65%', () => {
  const sampleScores: ChakraScores = {
    basico: 82,
    sacral: 74,
    plexoSolar: 58, // < 65
    cardiaco: 86,
    laringeo: 52,   // < 65
    frontal: 78,
    coronario: 85,
    esplenico: 80,
  };
  assert.equal(countAttentionNeeded(sampleScores), 2);
  assert.deepEqual(getChakrasNeedingAttention(sampleScores), ['plexoSolar', 'laringeo']);
});

test('calculateScoreDelta formats comparison with previous session', () => {
  assert.equal(calculateScoreDelta(82, 68).formatted, '+14%');
  assert.equal(calculateScoreDelta(52, 60).formatted, '-8%');
  assert.equal(calculateScoreDelta(70, 70).formatted, 'Estável');
  assert.equal(calculateScoreDelta(70, undefined).formatted, 'Primeira análise');
});
