import type { GeneratedActivity } from '@core/index';
import { activityToFrames, type Frame } from './frames';

// Placeholder Even Hub integration. The real implementation will
// import the Even SDK and render frames to the HUD.

interface EvenHub {
  showText(opts: { primary: string; secondary?: string }): Promise<void>;
  clear(): Promise<void>;
  on(event: 'tap' | 'swipe', handler: () => void): void;
}

declare const evenHub: EvenHub | undefined;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const playActivity = async (activity: GeneratedActivity): Promise<void> => {
  const frames = activityToFrames(activity);
  if (typeof evenHub === 'undefined') {
    console.warn('Even Hub runtime not available; logging frames instead.');
    for (const f of frames) console.log(formatFrame(f));
    return;
  }

  for (const frame of frames) {
    await evenHub.showText({ primary: frame.primary, secondary: frame.secondary });
    await sleep(frame.durationMs);
  }
  await evenHub.clear();
};

const formatFrame = (f: Frame): string =>
  f.secondary ? `[${f.kind}] ${f.primary} — ${f.secondary}` : `[${f.kind}] ${f.primary}`;
