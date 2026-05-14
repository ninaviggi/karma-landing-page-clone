import type { AudioFrame, AudioFrameType, GeneratedActivity } from './types';

export interface FramePauseDefaults {
  pauseAfterBase: number;
  pauseAfterNormal: number;
  pauseAfterSlow: number;
}

export const DEFAULT_PAUSES: Record<AudioFrameType, FramePauseDefaults> = {
  word: { pauseAfterBase: 1500, pauseAfterNormal: 2000, pauseAfterSlow: 2000 },
  sentence: {
    pauseAfterBase: 1000,
    pauseAfterNormal: 3000,
    pauseAfterSlow: 3000,
  },
  step: { pauseAfterBase: 2000, pauseAfterNormal: 2000, pauseAfterSlow: 3000 },
  wonder: { pauseAfterBase: 2000, pauseAfterNormal: 5000, pauseAfterSlow: 0 },
};

export type AudioResolver = (
  text: string,
  language: 'base' | 'target',
  speed: 'normal' | 'slow'
) => string;

const emptyResolver: AudioResolver = () => '';

const frameId = (prefix: string, index: number): string =>
  `${prefix}-${index.toString().padStart(2, '0')}`;

export interface BuildFramesOptions {
  resolveAudio?: AudioResolver;
  pauses?: Partial<Record<AudioFrameType, FramePauseDefaults>>;
}

export const buildAudioFrames = (
  activity: GeneratedActivity,
  options: BuildFramesOptions = {}
): AudioFrame[] => {
  const resolve = options.resolveAudio ?? emptyResolver;
  const pauses = { ...DEFAULT_PAUSES, ...(options.pauses ?? {}) };
  const frames: AudioFrame[] = [];

  let position = 0;
  const total =
    activity.vocabulary.length +
    activity.sentences.length +
    activity.steps.length +
    1;

  const push = (
    type: AudioFrameType,
    id: string,
    base: string,
    target: string,
    extras: Partial<Pick<AudioFrame, 'phonetic' | 'context' | 'instruction'>> = {}
  ): void => {
    const p = pauses[type];
    frames.push({
      id,
      type,
      position,
      totalFrames: total,
      baseText: base,
      targetText: target,
      audioBase: resolve(base, 'base', 'normal'),
      audioTargetNormal: resolve(target, 'target', 'normal'),
      audioTargetSlow: resolve(target, 'target', 'slow'),
      pauseAfterBase: p.pauseAfterBase,
      pauseAfterNormal: p.pauseAfterNormal,
      pauseAfterSlow: p.pauseAfterSlow,
      ...extras,
    });
    position += 1;
  };

  activity.vocabulary.forEach((v, i) =>
    push('word', frameId('word', i), v.translation, v.word, {
      phonetic: v.phonetic,
    })
  );

  activity.sentences.forEach((s, i) =>
    push('sentence', frameId('sentence', i), s.translation, s.sentence, {
      context: s.context,
    })
  );

  activity.steps.forEach((step, i) =>
    push('step', frameId('step', i), step.translation, step.languagePrompt, {
      instruction: step.instruction,
    })
  );

  push(
    'wonder',
    'wonder-00',
    activity.wonderQuestion.translation,
    activity.wonderQuestion.question
  );

  return frames;
};

export const collectFrameTexts = (
  frames: AudioFrame[]
): Array<{ text: string; role: 'base' | 'target'; needsSlow: boolean }> => {
  const seen = new Set<string>();
  const out: Array<{ text: string; role: 'base' | 'target'; needsSlow: boolean }> = [];
  for (const f of frames) {
    const baseKey = `base:${f.baseText}`;
    if (!seen.has(baseKey)) {
      seen.add(baseKey);
      out.push({ text: f.baseText, role: 'base', needsSlow: false });
    }
    const targetKey = `target:${f.targetText}`;
    if (!seen.has(targetKey)) {
      seen.add(targetKey);
      out.push({ text: f.targetText, role: 'target', needsSlow: true });
    }
  }
  return out;
};
