export interface StepProgress {
  current: number;
  total: number;
  percent: number;
}

export function getStepProgress(currentStep: number, totalSteps: number): StepProgress {
  const total = Math.max(0, Math.trunc(totalSteps));

  if (total === 0) {
    return { current: 0, total: 0, percent: 0 };
  }

  const safeStep = Math.min(Math.max(Math.trunc(currentStep), 0), total - 1);
  const current = safeStep + 1;

  return {
    current,
    total,
    percent: Math.round((current / total) * 100),
  };
}
