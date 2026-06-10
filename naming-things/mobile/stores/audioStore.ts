import { create } from 'zustand';
import {
  buildAudioFrames,
  type AudioFrame,
  type GeneratedActivity,
  type LanguageCode,
} from '@core/index';
import { playQueue, stopAllAudio } from '@/services/audioPlayer';
import {
  cacheUri,
  isCachingEnabled,
  precacheTexts,
  type BatchProgress,
} from '@/services/tts';
import {
  startRemoteControls,
  stopRemoteControls,
  updateNowPlaying,
} from '@/services/remoteControls';

type Status =
  | 'idle'
  | 'preparing'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'completed'
  | 'error';

interface PrepareArgs {
  activity: GeneratedActivity;
  baseLanguage: LanguageCode;
  learningLanguage: LanguageCode;
}

interface AudioState {
  status: Status;
  error: string | null;
  frames: AudioFrame[];
  position: number;
  cacheProgress: BatchProgress | null;
  baseLanguage: LanguageCode;
  learningLanguage: LanguageCode;
  abort: AbortController | null;
  prepare: (args: PrepareArgs) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  next: () => void;
  previous: () => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  status: 'idle',
  error: null,
  frames: [],
  position: 0,
  cacheProgress: null,
  baseLanguage: 'en',
  learningLanguage: 'en',
  abort: null,

  prepare: async ({ activity, baseLanguage, learningLanguage }) => {
    set({
      status: 'preparing',
      error: null,
      position: 0,
      baseLanguage,
      learningLanguage,
      cacheProgress: null,
    });

    const framesNoAudio = buildAudioFrames(activity);

    const ttsItems = [
      ...new Map(
        framesNoAudio.flatMap((f) => [
          [
            `${baseLanguage}:normal:${f.baseText}`,
            { text: f.baseText, language: baseLanguage, speed: 'normal' as const },
          ],
          [
            `${learningLanguage}:normal:${f.targetText}`,
            {
              text: f.targetText,
              language: learningLanguage,
              speed: 'normal' as const,
            },
          ],
          [
            `${learningLanguage}:slow:${f.targetText}`,
            {
              text: f.targetText,
              language: learningLanguage,
              speed: 'slow' as const,
            },
          ],
        ])
      ).values(),
    ];

    if (!isCachingEnabled()) {
      set({
        frames: framesNoAudio,
        status: 'ready',
        cacheProgress: { done: ttsItems.length, total: ttsItems.length },
      });
      return;
    }

    try {
      await precacheTexts(ttsItems, (p) =>
        set({ cacheProgress: p })
      );
    } catch (err) {
      set({
        status: 'error',
        error:
          err instanceof Error ? err.message : 'Failed to prepare audio',
      });
      return;
    }

    const frames = buildAudioFrames(activity, {
      resolveAudio: (text, role, speed) =>
        cacheUri({
          text,
          language: role === 'base' ? baseLanguage : learningLanguage,
          speed,
        }),
    });

    set({ frames, status: 'ready' });
  },

  play: async () => {
    const state = get();
    if (state.status === 'playing') return;
    if (state.frames.length === 0) return;

    const controller = new AbortController();
    set({ status: 'playing', abort: controller });

    startRemoteControls({
      onPlayPause: () => {
        const s = get();
        if (s.status === 'playing') s.pause();
        else if (s.status === 'paused') void s.play();
      },
      onNext: () => get().next(),
      onPrevious: () => get().previous(),
    });

    const startAt = state.position;
    try {
      const result = await playQueue(state.frames, {
        baseLanguage: state.baseLanguage,
        learningLanguage: state.learningLanguage,
        signal: controller.signal,
        startAt,
        onFrameStart: (index) => {
          set({ position: index });
          const frame = get().frames[index];
          if (frame) {
            updateNowPlaying({
              title: frame.targetText,
              subtitle: frame.baseText,
              positionFrames: index + 1,
              totalFrames: get().frames.length,
            });
          }
        },
      });
      stopRemoteControls();
      if (result.completed) {
        set({ status: 'completed', abort: null, position: 0 });
      } else {
        set({
          status: 'paused',
          abort: null,
          position: result.stoppedAt,
        });
      }
    } catch (err) {
      stopRemoteControls();
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Playback failed',
        abort: null,
      });
    }
  },

  pause: () => {
    const { abort } = get();
    if (abort) abort.abort();
    stopAllAudio();
    set({ status: 'paused' });
  },

  next: () => {
    const { position, frames, status, abort } = get();
    const target = Math.min(position + 1, frames.length - 1);
    if (status === 'playing' && abort) {
      abort.abort();
      stopAllAudio();
      set({ position: target, status: 'paused' });
      void get().play();
    } else {
      set({ position: target });
    }
  },

  previous: () => {
    const { position, status, abort } = get();
    const target = Math.max(position - 1, 0);
    if (status === 'playing' && abort) {
      abort.abort();
      stopAllAudio();
      set({ position: target, status: 'paused' });
      void get().play();
    } else {
      set({ position: target });
    }
  },

  reset: () => {
    const { abort } = get();
    if (abort) abort.abort();
    stopAllAudio();
    stopRemoteControls();
    set({
      status: 'idle',
      error: null,
      frames: [],
      position: 0,
      cacheProgress: null,
      abort: null,
    });
  },
}));
