import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import {
  rateFor,
  resolveLocale,
  type AudioFrame,
  type AudioFrameType,
  type LanguageCode,
} from '@core/index';

// Metro resolves require() statically at bundle time, so we can't
// require the chime MP3s until the files actually exist in
// assets/sounds/ — a missing file fails the whole build, try/catch
// notwithstanding. Once the four MP3s land (see assets/sounds/README.md),
// replace these nulls with require('../assets/sounds/chime-word.mp3') etc.
const CHIMES: Record<AudioFrameType | 'complete', number | null> = {
  word: null,
  sentence: null,
  step: null,
  wonder: null,
  complete: null,
};

let audioModeReady: Promise<void> | null = null;
const ensureAudioMode = (): Promise<void> => {
  if (!audioModeReady) {
    audioModeReady = Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    }).catch((err) => {
      console.warn('setAudioModeAsync failed', err);
    });
  }
  return audioModeReady;
};

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (ms <= 0) return resolve();
    if (signal?.aborted) return reject(new AbortError());
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new AbortError());
    };
    signal?.addEventListener('abort', onAbort);
  });

class AbortError extends Error {
  constructor() {
    super('aborted');
    this.name = 'AbortError';
  }
}

const playFile = async (
  source: number | { uri: string },
  signal?: AbortSignal
): Promise<void> => {
  if (signal?.aborted) throw new AbortError();
  const { sound } = await Audio.Sound.createAsync(source as any, {
    shouldPlay: true,
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        sound.stopAsync().catch(() => {});
        // stopAsync never reports didJustFinish, so settle here or we
        // hang forever waiting for a status update that won't come.
        reject(new AbortError());
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      const settle = (fn: () => void) => {
        signal?.removeEventListener('abort', onAbort);
        fn();
      };
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if ('error' in status && status.error) {
            settle(() => reject(new Error(status.error)));
          }
          return;
        }
        if (status.didJustFinish) settle(resolve);
      });
      // A very short file can finish before the listener attaches and
      // would never emit another update — check the current status once.
      sound.getStatusAsync().then((status) => {
        if (status.isLoaded && status.didJustFinish) settle(resolve);
      }, () => {});
    });
  } finally {
    await sound.unloadAsync().catch(() => {});
  }
};

const speakViaTts = async (
  text: string,
  language: LanguageCode,
  speed: 'normal' | 'slow',
  signal?: AbortSignal
): Promise<void> => {
  if (signal?.aborted) throw new AbortError();
  Speech.stop();
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      Speech.stop();
      reject(new AbortError());
    };
    signal?.addEventListener('abort', onAbort);
    Speech.speak(text, {
      language: resolveLocale(language),
      rate: rateFor(speed),
      pitch: 1.0,
      onDone: () => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      },
      onStopped: () => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      },
      onError: (err) => {
        signal?.removeEventListener('abort', onAbort);
        reject(err);
      },
    });
  });
};

const playChime = async (
  type: AudioFrameType | 'complete',
  signal?: AbortSignal
): Promise<void> => {
  const asset = CHIMES[type];
  if (!asset) return;
  try {
    await playFile(asset, signal);
  } catch (err) {
    if (err instanceof AbortError) throw err;
    // Chime missing or unplayable — skip silently.
  }
};

const playTextOrFile = async (
  filePath: string,
  fallbackText: string,
  language: LanguageCode,
  speed: 'normal' | 'slow',
  signal?: AbortSignal
): Promise<void> => {
  if (filePath) {
    try {
      await playFile({ uri: filePath }, signal);
      return;
    } catch (err) {
      if (err instanceof AbortError) throw err;
      console.warn('Cached audio failed, falling back to TTS', err);
    }
  }
  await speakViaTts(fallbackText, language, speed, signal);
};

export interface PlayContext {
  baseLanguage: LanguageCode;
  learningLanguage: LanguageCode;
  signal: AbortSignal;
  onFrameStart?: (index: number) => void;
}

export const playFrame = async (
  frame: AudioFrame,
  ctx: PlayContext
): Promise<void> => {
  await ensureAudioMode();
  ctx.onFrameStart?.(frame.position);

  await playChime(frame.type, ctx.signal);

  await playTextOrFile(
    frame.audioBase,
    frame.baseText,
    ctx.baseLanguage,
    'normal',
    ctx.signal
  );
  await sleep(frame.pauseAfterBase, ctx.signal);

  await playTextOrFile(
    frame.audioTargetNormal,
    frame.targetText,
    ctx.learningLanguage,
    'normal',
    ctx.signal
  );
  await sleep(frame.pauseAfterNormal, ctx.signal);

  await playTextOrFile(
    frame.audioTargetSlow,
    frame.targetText,
    ctx.learningLanguage,
    'slow',
    ctx.signal
  );
  await sleep(frame.pauseAfterSlow, ctx.signal);
};

export interface QueueContext extends Omit<PlayContext, 'signal'> {
  signal: AbortSignal;
  startAt?: number;
}

export const playQueue = async (
  frames: AudioFrame[],
  ctx: QueueContext
): Promise<{ completed: boolean; stoppedAt: number }> => {
  const startAt = ctx.startAt ?? 0;
  for (let i = startAt; i < frames.length; i++) {
    if (ctx.signal.aborted) return { completed: false, stoppedAt: i };
    try {
      await playFrame(frames[i], ctx);
    } catch (err) {
      if (err instanceof AbortError) return { completed: false, stoppedAt: i };
      throw err;
    }
  }
  await playChime('complete', ctx.signal).catch(() => {});
  return { completed: true, stoppedAt: frames.length };
};

export const stopAllAudio = (): void => {
  Speech.stop();
};
