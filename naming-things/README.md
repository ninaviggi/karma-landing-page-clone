# Naming Things — v0.1

A native mobile app for parents learning a language alongside their young child. Describe what you're about to do together; the app generates a bilingual activity guide: vocabulary, sentences, step-by-step prompts, and a wonder question to spark conversation.

This is the **v0.1 MVP** built with Expo + React Native, per the product spec.

## What's in v0.1

- Local-only onboarding (set learning language, child age, child name)
- Home screen with text input and activity suggestions
- Activity generation via Claude API
- Activity card: vocabulary, sentences, expandable steps, wonder question
- Audio playback for all words and sentences (normal speed, platform-native TTS)
- Vocabulary bank — persistent SQLite store across sessions
- Basic progress view (word/sentence/session counts)

Deferred to later versions: accounts/cloud sync, voice input, slow-speed audio, mid-activity translate, flashcard practice, repeat-activity intelligence, child mode, patterns, streaks.

## Getting started

```bash
cd naming-things
npm install
cp .env.example .env
# add your Claude API key to .env
npm run start
```

Then open in Expo Go (iOS/Android) or run a native build.

## Configuration

Set the Claude API key via an Expo public env var:

```
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...
```

Note: `EXPO_PUBLIC_*` vars are bundled into the client. For production you'll want to proxy through a backend so the key isn't shipped to devices — for the MVP this is fine.

The model is set in `services/ai.ts` (defaults to `claude-sonnet-4-6`).

## TTS

v0.1 uses `expo-speech` (platform-native: AVSpeechSynthesizer on iOS, TextToSpeech on Android). ElevenLabs integration with cached audio files is on the v0.2 roadmap — the `audio.ts` service is the swap-in point.

## File layout

```
naming-things/
├── app/                    # expo-router routes
│   ├── (tabs)/             # Home, Bank, Progress tabs
│   ├── activity/[id].tsx   # Generated activity card
│   ├── onboarding/         # First-launch setup
│   └── _layout.tsx
├── components/             # ActivityCard, VocabCard, AudioButton, ...
├── services/               # ai (Claude), audio (TTS), storage (SQLite)
├── stores/                 # Zustand: user, vocab, session
├── constants/              # theme, prompts, suggestions
└── types/
```

## Design

Swiss-modern, typography-driven, generous whitespace, muted earth tones. Closer to a Braun manual than a children's app. The warmth comes from the activity, not the UI. Design tokens live in `constants/theme.ts`.
