import type { GeneratedActivity } from '@core/index';

export interface Frame {
  kind: 'vocab' | 'sentence' | 'step' | 'wonder';
  primary: string;
  secondary?: string;
  durationMs: number;
}

const VOCAB_FRAME_MS = 4_000;
const SENTENCE_FRAME_MS = 6_000;
const STEP_FRAME_MS = 8_000;
const WONDER_FRAME_MS = 10_000;

export const activityToFrames = (activity: GeneratedActivity): Frame[] => {
  const frames: Frame[] = [];

  for (const v of activity.vocabulary) {
    frames.push({
      kind: 'vocab',
      primary: v.word,
      secondary: v.translation,
      durationMs: VOCAB_FRAME_MS,
    });
  }

  for (const s of activity.sentences) {
    frames.push({
      kind: 'sentence',
      primary: s.sentence,
      secondary: s.translation,
      durationMs: SENTENCE_FRAME_MS,
    });
  }

  for (const step of activity.steps) {
    frames.push({
      kind: 'step',
      primary: step.languagePrompt,
      secondary: step.instruction,
      durationMs: STEP_FRAME_MS,
    });
  }

  frames.push({
    kind: 'wonder',
    primary: activity.wonderQuestion.question,
    secondary: activity.wonderQuestion.translation,
    durationMs: WONDER_FRAME_MS,
  });

  return frames;
};
