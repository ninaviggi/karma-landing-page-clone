// Remote controls (AirPod stem taps, lockscreen, Bluetooth headset buttons).
//
// Implementing real lockscreen / AirPod controls requires a native module
// that bridges MPRemoteCommandCenter (iOS) and MediaSession (Android).
// Expo Go does not expose these APIs; a dev build with
// react-native-track-player (or similar) is required.
//
// This module presents the API surface the audio mode wants today.
// When the native module lands, swap the no-op bodies for the real
// implementations and the rest of the app keeps working unchanged.

export interface RemoteHandlers {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export interface NowPlayingInfo {
  title: string;
  subtitle?: string;
  positionFrames: number;
  totalFrames: number;
}

export const startRemoteControls = (_handlers: RemoteHandlers): void => {
  // TODO: register MPRemoteCommandCenter + MediaSession handlers.
};

export const stopRemoteControls = (): void => {
  // TODO: tear down the registration.
};

export const updateNowPlaying = (_info: NowPlayingInfo): void => {
  // TODO: push to MPNowPlayingInfoCenter / Android MediaMetadata.
};
