import { describe, expect, it } from 'vitest';

import { getStepProgress } from '@/components/Pro/ProStepForm/progress';

describe('getStepProgress', () => {
  it.each([
    { currentStep: 0, totalSteps: 3, expected: { current: 1, total: 3, percent: 33 } },
    { currentStep: 1, totalSteps: 3, expected: { current: 2, total: 3, percent: 67 } },
    { currentStep: 2, totalSteps: 3, expected: { current: 3, total: 3, percent: 100 } },
  ])('calculates progress for step $currentStep', ({ currentStep, totalSteps, expected }) => {
    expect(getStepProgress(currentStep, totalSteps)).toEqual(expected);
  });

  it('returns an empty progress state when there are no steps', () => {
    expect(getStepProgress(0, 0)).toEqual({ current: 0, total: 0, percent: 0 });
  });

  it('clamps steps outside the available range', () => {
    expect(getStepProgress(-1, 3)).toEqual({ current: 1, total: 3, percent: 33 });
    expect(getStepProgress(8, 3)).toEqual({ current: 3, total: 3, percent: 100 });
  });
});
