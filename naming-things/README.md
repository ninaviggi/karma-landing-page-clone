# Naming Things

A bilingual activity guide for parents learning a language alongside their young child. Describe what you're about to do together; the app generates vocabulary, sentences, step-by-step prompts, and a wonder question to spark conversation.

## Layout

```
naming-things/
├── core/                    shared, platform-agnostic
│   ├── types.ts             type definitions
│   ├── languages.ts         language metadata + locale helpers
│   ├── prompts.ts           system + user prompt construction
│   ├── ai.ts                Claude API client
│   ├── audio.ts             TTS request shape, locale/rate helpers
│   ├── storage.ts           StorageAdapter interface
│   ├── sessions.ts          session domain (create / get / list)
│   ├── vocab.ts             vocabulary queries
│   └── index.ts             barrel
│
├── mobile/                  React Native (Expo Router) app
│   ├── app/                 expo-router routes
│   ├── components/          UI components
│   ├── stores/              Zustand: user / vocab / session
│   ├── constants/           theme, suggestion defaults
│   ├── platform/            SQLite + expo-speech (implements core/storage, calls core/audio)
│   ├── config.ts            mobile-only env access (API key)
│   └── ...                  Expo / Metro / Babel / TS config
│
└── glasses/                 Even Hub app (stub)
    ├── src/main.ts          activity playback runtime
    ├── src/frames.ts        activity → HUD frames
    └── app.json             Even Hub manifest
```

`core/` has zero platform dependencies (no `expo-*`, no SQLite, no React). Both `mobile/` and `glasses/` consume it.

## Path aliases

Inside `mobile/`:
- `@/*` → `mobile/*`
- `@core/*` → `core/*`
- `@core` → `core/index`

Inside `glasses/`:
- `@core/*` → `core/*`

Wired in `tsconfig.json` (for type-checking) and `babel.config.js` via `babel-plugin-module-resolver` (for runtime). Metro's `watchFolders` includes `core/` so changes hot-reload.

## Running the mobile app

```bash
cd mobile
npm install
cp .env.example .env        # add EXPO_PUBLIC_CLAUDE_API_KEY
npm run start
```

Open in Expo Go (iOS/Android).

## Storage

`core/storage.ts` defines a `StorageAdapter` interface. `mobile/platform/storage.ts` provides `sqliteAdapter` (expo-sqlite). Glasses can implement its own adapter later, or stream activity data from a synced backend.

`core/sessions.ts` and `core/vocab.ts` are storage-agnostic — they take an adapter as their first argument. This is the seam that lets the same domain logic run on phone and HUD.

## TTS

v0.1 uses platform-native TTS (`expo-speech`) via `mobile/platform/audio.ts`. `core/audio.ts` holds locale resolution and rate constants so any platform can compose its own speak function. ElevenLabs swap-in is a future addition that will live in `core/audio.ts`.

## Design

Swiss-modern, typography-driven, muted earth tones. Tokens in `mobile/constants/theme.ts`; the prototype at `../prototype/` mirrors the same tokens.
