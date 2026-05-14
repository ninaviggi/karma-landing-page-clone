import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory}tts/`;
const INDEX_FILE = `${CACHE_DIR}index.json`;
const MAX_FILES = 500;

interface IndexEntry {
  key: string;
  filename: string;
  bytes: number;
  lastUsedAt: number;
}

interface CacheIndex {
  entries: IndexEntry[];
}

let indexCache: CacheIndex | null = null;
let initPromise: Promise<void> | null = null;

const ensureInit = async (): Promise<void> => {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
    try {
      const text = await FileSystem.readAsStringAsync(INDEX_FILE);
      indexCache = JSON.parse(text) as CacheIndex;
    } catch {
      indexCache = { entries: [] };
    }
  })();
  return initPromise;
};

const persistIndex = async (): Promise<void> => {
  if (!indexCache) return;
  await FileSystem.writeAsStringAsync(INDEX_FILE, JSON.stringify(indexCache));
};

export const cacheKey = (
  text: string,
  language: string,
  speed: string
): string => {
  const safe = `${language}|${speed}|${text}`;
  let hash = 0;
  for (let i = 0; i < safe.length; i++) {
    hash = (hash << 5) - hash + safe.charCodeAt(i);
    hash |= 0;
  }
  return `${language}_${speed}_${Math.abs(hash).toString(36)}`;
};

export const cachedPathFor = (key: string): string =>
  `${CACHE_DIR}${key}.mp3`;

export const getCached = async (key: string): Promise<string | null> => {
  await ensureInit();
  const entry = indexCache!.entries.find((e) => e.key === key);
  if (!entry) return null;
  const path = `${CACHE_DIR}${entry.filename}`;
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    indexCache!.entries = indexCache!.entries.filter((e) => e.key !== key);
    await persistIndex();
    return null;
  }
  entry.lastUsedAt = Date.now();
  await persistIndex();
  return path;
};

export const storeCached = async (
  key: string,
  bytes: Uint8Array
): Promise<string> => {
  await ensureInit();
  const filename = `${key}.mp3`;
  const path = `${CACHE_DIR}${filename}`;
  const base64 = bytesToBase64(bytes);
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  indexCache!.entries = indexCache!.entries.filter((e) => e.key !== key);
  indexCache!.entries.push({
    key,
    filename,
    bytes: bytes.byteLength,
    lastUsedAt: Date.now(),
  });
  await evictIfNeeded();
  await persistIndex();
  return path;
};

const evictIfNeeded = async (): Promise<void> => {
  if (!indexCache) return;
  if (indexCache.entries.length <= MAX_FILES) return;
  indexCache.entries.sort((a, b) => a.lastUsedAt - b.lastUsedAt);
  const toDrop = indexCache.entries.splice(
    0,
    indexCache.entries.length - MAX_FILES
  );
  for (const entry of toDrop) {
    try {
      await FileSystem.deleteAsync(`${CACHE_DIR}${entry.filename}`, {
        idempotent: true,
      });
    } catch {
      // best-effort
    }
  }
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize))
    );
  }
  if (typeof btoa === 'function') return btoa(binary);
  return Buffer.from(binary, 'binary').toString('base64');
};
