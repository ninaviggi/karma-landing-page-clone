import type { GeneratedActivity, Session } from './types';
import type { StorageAdapter } from './storage';

const newId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const createSession = async (
  adapter: StorageAdapter,
  activityText: string,
  generated: GeneratedActivity
): Promise<Session> => {
  const session: Session = {
    id: newId(),
    activityText,
    generated,
    createdAt: Date.now(),
  };
  await adapter.insertSession(session);

  const activityName = generated.title || activityText;
  await adapter.upsertVocabulary(
    generated.vocabulary.map((v) => ({
      word: v.word,
      translation: v.translation,
      phonetic: v.phonetic,
      sourceSessionId: session.id,
      activityName,
    }))
  );
  await adapter.upsertSentences(
    generated.sentences.map((s) => ({
      sentence: s.sentence,
      translation: s.translation,
      context: s.context,
      sourceSessionId: session.id,
      activityName,
    }))
  );

  return session;
};

export const getSession = (
  adapter: StorageAdapter,
  id: string
): Promise<Session | null> => adapter.getSession(id);

export const listSessions = (
  adapter: StorageAdapter
): Promise<Session[]> => adapter.listSessions();
