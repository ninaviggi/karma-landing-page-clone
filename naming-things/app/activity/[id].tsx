import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { theme } from '@/constants/theme';
import { getSession } from '@/services/storage';
import { stopSpeaking } from '@/services/audio';
import type { Session } from '@/types';
import { useUserStore } from '@/stores/userStore';

export default function ActivityScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const prefs = useUserStore((s) => s.prefs);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const s = await getSession(id);
      if (!cancelled) {
        setSession(s);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [id]);

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
        <Text style={styles.activityText} numberOfLines={1}>
          {session.activityText}
        </Text>
      </View>
      <ActivityCard
        activity={session.generated}
        language={prefs?.learningLanguage ?? 'fr'}
      />
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
  activityText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textTertiary,
    textAlign: 'right',
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
