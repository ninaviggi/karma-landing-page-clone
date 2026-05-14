import * as SQLite from 'expo-sqlite';
import type {
  GeneratedActivity,
  SentenceItem,
  Session,
  UserPreferences,
  VocabularyItem,
} from '@/types';

const DB_NAME = 'naming-things.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDb = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS preferences (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          base_language TEXT NOT NULL,
          learning_language TEXT NOT NULL,
          child_age INTEGER NOT NULL,
          child_name TEXT,
          onboarded INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          activity_text TEXT NOT NULL,
          generated_json TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          duration_seconds INTEGER,
          rating TEXT
        );
        CREATE TABLE IF NOT EXISTS vocabulary (
          id TEXT PRIMARY KEY,
          word TEXT NOT NULL,
          translation TEXT NOT NULL,
          phonetic TEXT NOT NULL,
          source_session_id TEXT NOT NULL,
          activity_name TEXT NOT NULL,
          encounter_count INTEGER NOT NULL DEFAULT 1,
          created_at INTEGER NOT NULL,
          last_reviewed_at INTEGER,
          UNIQUE(word, translation)
        );
        CREATE TABLE IF NOT EXISTS sentences (
          id TEXT PRIMARY KEY,
          sentence TEXT NOT NULL,
          translation TEXT NOT NULL,
          context TEXT NOT NULL,
          source_session_id TEXT NOT NULL,
          activity_name TEXT NOT NULL,
          encounter_count INTEGER NOT NULL DEFAULT 1,
          created_at INTEGER NOT NULL,
          UNIQUE(sentence)
        );
        CREATE INDEX IF NOT EXISTS idx_vocab_created ON vocabulary(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_sentences_created ON sentences(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
      `);
      return db;
    });
  }
  return dbPromise;
};

const newId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

interface PreferencesRow {
  base_language: string;
  learning_language: string;
  child_age: number;
  child_name: string | null;
  onboarded: number;
}

export const loadPreferences = async (): Promise<UserPreferences | null> => {
  const db = await getDb();
  const row = await db.getFirstAsync<PreferencesRow>(
    'SELECT base_language, learning_language, child_age, child_name, onboarded FROM preferences WHERE id = 1'
  );
  if (!row) return null;
  return {
    baseLanguage: row.base_language as UserPreferences['baseLanguage'],
    learningLanguage:
      row.learning_language as UserPreferences['learningLanguage'],
    childAge: row.child_age,
    childName: row.child_name ?? undefined,
    onboarded: row.onboarded === 1,
  };
};

export const savePreferences = async (
  prefs: UserPreferences
): Promise<void> => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO preferences (id, base_language, learning_language, child_age, child_name, onboarded)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       base_language = excluded.base_language,
       learning_language = excluded.learning_language,
       child_age = excluded.child_age,
       child_name = excluded.child_name,
       onboarded = excluded.onboarded`,
    [
      prefs.baseLanguage,
      prefs.learningLanguage,
      prefs.childAge,
      prefs.childName ?? null,
      prefs.onboarded ? 1 : 0,
    ]
  );
};

interface SessionRow {
  id: string;
  activity_text: string;
  generated_json: string;
  created_at: number;
  duration_seconds: number | null;
  rating: string | null;
}

const mapSession = (row: SessionRow): Session => ({
  id: row.id,
  activityText: row.activity_text,
  generated: JSON.parse(row.generated_json) as GeneratedActivity,
  createdAt: row.created_at,
  durationSeconds: row.duration_seconds ?? undefined,
  rating: (row.rating as Session['rating']) ?? undefined,
});

export const saveSession = async (
  activityText: string,
  generated: GeneratedActivity
): Promise<Session> => {
  const db = await getDb();
  const session: Session = {
    id: newId(),
    activityText,
    generated,
    createdAt: Date.now(),
  };
  await db.runAsync(
    'INSERT INTO sessions (id, activity_text, generated_json, created_at) VALUES (?, ?, ?, ?)',
    [session.id, session.activityText, JSON.stringify(generated), session.createdAt]
  );
  await persistVocabFromSession(session);
  return session;
};

export const getSession = async (id: string): Promise<Session | null> => {
  const db = await getDb();
  const row = await db.getFirstAsync<SessionRow>(
    'SELECT id, activity_text, generated_json, created_at, duration_seconds, rating FROM sessions WHERE id = ?',
    [id]
  );
  return row ? mapSession(row) : null;
};

export const listSessions = async (): Promise<Session[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<SessionRow>(
    'SELECT id, activity_text, generated_json, created_at, duration_seconds, rating FROM sessions ORDER BY created_at DESC'
  );
  return rows.map(mapSession);
};

interface VocabRow {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  source_session_id: string;
  activity_name: string;
  encounter_count: number;
  created_at: number;
  last_reviewed_at: number | null;
}

const mapVocab = (row: VocabRow): VocabularyItem => ({
  id: row.id,
  word: row.word,
  translation: row.translation,
  phonetic: row.phonetic,
  sourceSessionId: row.source_session_id,
  activityName: row.activity_name,
  encounterCount: row.encounter_count,
  createdAt: row.created_at,
  lastReviewedAt: row.last_reviewed_at ?? undefined,
});

interface SentenceRow {
  id: string;
  sentence: string;
  translation: string;
  context: string;
  source_session_id: string;
  activity_name: string;
  encounter_count: number;
  created_at: number;
}

const mapSentence = (row: SentenceRow): SentenceItem => ({
  id: row.id,
  sentence: row.sentence,
  translation: row.translation,
  context: row.context,
  sourceSessionId: row.source_session_id,
  activityName: row.activity_name,
  encounterCount: row.encounter_count,
  createdAt: row.created_at,
});

const persistVocabFromSession = async (session: Session): Promise<void> => {
  const db = await getDb();
  const now = Date.now();
  const activityName = session.generated.title || session.activityText;

  for (const v of session.generated.vocabulary) {
    await db.runAsync(
      `INSERT INTO vocabulary (id, word, translation, phonetic, source_session_id, activity_name, encounter_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)
       ON CONFLICT(word, translation) DO UPDATE SET
         encounter_count = encounter_count + 1`,
      [newId(), v.word, v.translation, v.phonetic, session.id, activityName, now]
    );
  }

  for (const s of session.generated.sentences) {
    await db.runAsync(
      `INSERT INTO sentences (id, sentence, translation, context, source_session_id, activity_name, encounter_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)
       ON CONFLICT(sentence) DO UPDATE SET
         encounter_count = encounter_count + 1`,
      [
        newId(),
        s.sentence,
        s.translation,
        s.context,
        session.id,
        activityName,
        now,
      ]
    );
  }
};

export const listVocabulary = async (): Promise<VocabularyItem[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<VocabRow>(
    'SELECT * FROM vocabulary ORDER BY created_at DESC'
  );
  return rows.map(mapVocab);
};

export const listSentences = async (): Promise<SentenceItem[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<SentenceRow>(
    'SELECT * FROM sentences ORDER BY created_at DESC'
  );
  return rows.map(mapSentence);
};

export const previousVocabularyWords = async (): Promise<string[]> => {
  const db = await getDb();
  const rows = await db.getAllAsync<{ word: string }>(
    'SELECT word FROM vocabulary ORDER BY created_at DESC LIMIT 200'
  );
  return rows.map((r) => r.word);
};

export const counts = async (): Promise<{
  words: number;
  sentences: number;
  sessions: number;
}> => {
  const db = await getDb();
  const words = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM vocabulary'
  );
  const sentences = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM sentences'
  );
  const sessions = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM sessions'
  );
  return {
    words: words?.c ?? 0,
    sentences: sentences?.c ?? 0,
    sessions: sessions?.c ?? 0,
  };
};
