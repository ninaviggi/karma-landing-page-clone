import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { GeneratedActivity, LanguageCode } from '@/types';
import { SentenceCard } from './SentenceCard';
import { StepCard } from './StepCard';
import { VocabCard } from './VocabCard';
import { WonderCard } from './WonderCard';

interface Props {
  activity: GeneratedActivity;
  language: LanguageCode;
}

export const ActivityCard = ({ activity, language }: Props) => (
  <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
  >
    <Text style={styles.title}>{activity.title}</Text>

    <Section label="VOCABULARY">
      <View style={styles.vocabGrid}>
        {activity.vocabulary.map((v, i) => (
          <View key={`${v.word}-${i}`} style={styles.vocabCell}>
            <VocabCard
              word={v.word}
              translation={v.translation}
              phonetic={v.phonetic}
              language={language}
            />
          </View>
        ))}
      </View>
    </Section>

    <Section label="SENTENCES">
      <View style={styles.stack}>
        {activity.sentences.map((s, i) => (
          <SentenceCard
            key={`${s.sentence}-${i}`}
            sentence={s.sentence}
            translation={s.translation}
            context={s.context}
            language={language}
          />
        ))}
      </View>
    </Section>

    <Section label="STEPS">
      <View style={styles.stack}>
        {activity.steps.map((step, i) => (
          <StepCard key={i} index={i} step={step} language={language} />
        ))}
      </View>
    </Section>

    <WonderCard
      question={activity.wonderQuestion.question}
      translation={activity.wonderQuestion.translation}
      language={language}
    />
  </ScrollView>
);

const Section = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 34,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  vocabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  vocabCell: {
    width: '50%',
    padding: theme.spacing.xs,
  },
  stack: {
    gap: theme.spacing.sm,
  },
});
