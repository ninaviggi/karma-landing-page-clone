import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { ActivityStep, LanguageCode } from '@core/index';
import { AudioButton } from './AudioButton';

interface Props {
  index: number;
  step: ActivityStep;
  language: LanguageCode;
}

export const StepCard = ({ index, step, language }: Props) => {
  const [expanded, setExpanded] = useState(index === 0);
  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={[styles.card, expanded && styles.cardActive]}
    >
      <View style={styles.row}>
        <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
        <Text style={styles.instruction}>{step.instruction}</Text>
      </View>
      {expanded ? (
        <View style={styles.expanded}>
          <View style={styles.promptRow}>
            <Text style={styles.prompt}>{step.languagePrompt}</Text>
            <AudioButton
              text={step.languagePrompt}
              language={language}
              size="sm"
            />
          </View>
          <Text style={styles.translation}>{step.translation}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  cardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  number: {
    fontFamily: theme.typography.mono.fontFamily,
    fontSize: 13,
    color: theme.colors.textTertiary,
    width: 24,
    paddingTop: 2,
  },
  instruction: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
  },
  expanded: {
    paddingLeft: theme.spacing.md + 24,
    gap: theme.spacing.xs,
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  prompt: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.accent,
  },
  translation: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});
