import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useVocabStore } from '@/stores/vocabStore';

export default function Progress() {
  const totals = useVocabStore((s) => s.totals);
  const refresh = useVocabStore((s) => s.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>PROGRESS</Text>
        <Text style={styles.title}>Quietly growing.</Text>

        <View style={styles.statGrid}>
          <Stat label="Words learned" value={totals.words} />
          <Stat label="Sentences" value={totals.sentences} />
          <Stat label="Activities" value={totals.sessions} />
        </View>

        <Text style={styles.note}>
          No streaks, no badges. Just the language you've built together.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statGrid: {
    gap: theme.spacing.md,
  },
  stat: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 52,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  note: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});
