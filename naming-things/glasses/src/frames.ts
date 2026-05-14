import {
  buildAudioFrames,
  type AudioFrame,
  type GeneratedActivity,
} from '@core/index';

export interface HudFrame {
  kind: AudioFrame['type'];
  primary: string;
  secondary?: string;
  durationMs: number;
}

const TYPE_DURATIONS: Record<AudioFrame['type'], number> = {
  word: 4_000,
  sentence: 6_000,
  step: 8_000,
  wonder: 10_000,
};

export const audioFramesToHud = (frames: AudioFrame[]): HudFrame[] =>
  frames.map((f) => ({
    kind: f.type,
    primary: f.targetText,
    secondary: f.baseText,
    durationMs: TYPE_DURATIONS[f.type],
  }));

export const activityToHudFrames = (activity: GeneratedActivity): HudFrame[] =>
  audioFramesToHud(buildAudioFrames(activity));
