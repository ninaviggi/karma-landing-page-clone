import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategorySection } from '@/components/CategorySection';
import { GenerateInput } from '@/components/GenerateInput';
import { HOME_CATEGORIES } from '@/constants/suggestions';
import { LANGUAGES } from '@core/index';
import { theme } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { useVocabStore } from '@/stores/vocabStore';

export default function Home() {
  const router = useRouter();
  const prefs = useUserStore((s) => s.prefs);
  const totals = useVocabStore((s) => s.totals);
  const generate = useSessionStore((s) => s.generate);
  const status = useSessionStore((s) => s.status);
  const error = useSessionStore((s) => s.error);

  const learningLabel =
    LANGUAGES.find((l) => l.code === prefs?.learningLanguage)?.label ?? '';

  const handleGenerate = async (text: string) => {
    const session = await generate(text);
    if (session) {
      router.push(`/activity/${session.id}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>NAMING THINGS</Text>
            <Text style={styles.languagePill}>{learningLabel}</Text>
          </View>
        </View>

        <View style={styles.promptBlock}>
          <Text style={styles.prompt}>What are we doing?</Text>
          <GenerateInput
            onGenerate={handleGenerate}
            loading={status === 'generating'}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        {HOME_CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            title={cat.title}
            subtitle={cat.subtitle}
            items={cat.items}
            onSelect={handleGenerate}
          />
        ))}

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {totals.words} words · {totals.sentences} sentences
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  languagePill: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  promptBlock: {
    gap: theme.spacing.md,
  },
  prompt: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
  },
  error: {
    color: '#A02020',
    fontSize: 13,
  },
  summary: {
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  summaryText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
