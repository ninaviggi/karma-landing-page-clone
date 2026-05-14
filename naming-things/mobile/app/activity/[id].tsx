import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { ActivityCard } from '@/components/ActivityCard';
import { AudioModeView } from '@/components/AudioModeView';
import { ModeToggle, type Mode } from '@/components/ModeToggle';
import { theme } from '@/constants/theme';
import { sqliteAdapter as storage } from '@/platform/storage';
import { stopSpeaking } from '@/platform/audio';
import { getSession, type Session } from '@core/index';
import { useAudioStore } from '@/stores/audioStore';
import { useUserStore } from '@/stores/userStore';

export default function ActivityScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const prefs = useUserStore((s) => s.prefs);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('screen');

  const prepareAudio = useAudioStore((s) => s.prepare);
  const resetAudio = useAudioStore((s) => s.reset);
  const playAudio = useAudioStore((s) => s.play);
  const audioStatus = useAudioStore((s) => s.status);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const s = await getSession(storage, id);
      if (!cancelled) {
        setSession(s);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      stopSpeaking();
      resetAudio();
    };
  }, [id, resetAudio]);

  const startAudio = useMemo(
    () => async () => {
      if (!session || !prefs) return;
      setMode('audio');
      await prepareAudio({
        activity: session.generated,
        baseLanguage: prefs.baseLanguage,
        learningLanguage: prefs.learningLanguage,
      });
      await playAudio();
    },
    [session, prefs, prepareAudio, playAudio]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.missing}>Activity not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleModeChange = (next: Mode) => {
    if (next === 'audio') {
      void startAudio();
    } else {
      setMode('screen');
      resetAudio();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topbar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [styles.backLink, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backLinkText}>← Done</Text>
        </Pressable>
        <ModeToggle value={mode} onChange={handleModeChange} />
      </View>

      {mode === 'screen' ? (
        <>
          <ActivityCard
            activity={session.generated}
            language={prefs?.learningLanguage ?? 'fr'}
          />
          <View style={styles.audioCta}>
            <Pressable
              onPress={startAudio}
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            >
              <Text style={styles.ctaText}>
                {audioStatus === 'preparing'
                  ? 'Preparing audio...'
                  : 'Start audio mode'}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <AudioModeView onClose={() => handleModeChange('screen')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  topbar: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  backLink: {
    paddingVertical: theme.spacing.xs,
  },
  backLinkText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  audioCta: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cta: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  missing: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  backBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
  },
  backText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});
