import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SentenceCard } from '@/components/SentenceCard';
import { VocabCard } from '@/components/VocabCard';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { useVocabStore } from '@/stores/vocabStore';

type Tab = 'words' | 'sentences';

export default function Bank() {
  const [tab, setTab] = useState<Tab>('words');
  const vocabulary = useVocabStore((s) => s.vocabulary);
  const sentences = useVocabStore((s) => s.sentences);
  const refresh = useVocabStore((s) => s.refresh);
  const prefs = useUserStore((s) => s.prefs);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>VOCABULARY BANK</Text>
        <Text style={styles.title}>Everything you've learned</Text>
        <View style={styles.tabs}>
          <TabButton
            label={`Words · ${vocabulary.length}`}
            active={tab === 'words'}
            onPress={() => setTab('words')}
          />
          <TabButton
            label={`Sentences · ${sentences.length}`}
            active={tab === 'sentences'}
            onPress={() => setTab('sentences')}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === 'words' ? (
          vocabulary.length === 0 ? (
            <EmptyState text="No words yet. Generate an activity to start your bank." />
          ) : (
            <View style={styles.list}>
              {vocabulary.map((v) => (
                <View key={v.id}>
                  <VocabCard
                    word={v.word}
                    translation={v.translation}
                    phonetic={v.phonetic}
                    language={prefs?.learningLanguage ?? 'fr'}
                  />
                  <Text style={styles.meta}>
                    {v.activityName} · seen {v.encounterCount}×
                  </Text>
                </View>
              ))}
            </View>
          )
        ) : sentences.length === 0 ? (
          <EmptyState text="No sentences yet." />
        ) : (
          <View style={styles.list}>
            {sentences.map((s) => (
              <View key={s.id}>
                <SentenceCard
                  sentence={s.sentence}
                  translation={s.translation}
                  context={s.context}
                  language={prefs?.learningLanguage ?? 'fr'}
                />
                <Text style={styles.meta}>{s.activityName}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const TabButton = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.tabBtn, active && styles.tabBtnActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const EmptyState = ({ text }: { text: string }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  tabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  tabBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.accent,
  },
  tabText: {
    fontSize: 13,
    color: theme.colors.text,
  },
  tabTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingTop: 0,
    paddingBottom: theme.spacing.xxl,
  },
  list: {
    gap: theme.spacing.md,
  },
  meta: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  empty: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
