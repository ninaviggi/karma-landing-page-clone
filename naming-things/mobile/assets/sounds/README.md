# Sound assets

These four short chimes punctuate Audio Mode. Drop the MP3 files here
with these exact names:

- `chime-word.mp3` — soft single tone, ~300ms. Played before each vocab frame.
- `chime-sentence.mp3` — medium tone, ~500ms. Played before each sentence frame.
- `chime-step.mp3` — two-tone, ~600ms. Played before each step frame.
- `chime-complete.mp3` — gentle completion sound, ~1s. Played at the very end of a session.

If any file is missing, `audioPlayer.ts` falls back silently — playback
will still run, you just won't hear the punctuation.

Suggested tone: minor third or fifth, soft attack, short decay; the
chime should feel like a polite throat-clear, not an alert. Look at
the Calm or Headspace transition tones for reference.

Until real sounds are added, leave this README in place so the dir
stays tracked.
