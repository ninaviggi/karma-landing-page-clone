import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { LanguageCode } from '@core/index';
import { AudioButton } from './AudioButton';

interface Props {
  question: string;
  translation: string;
  language: LanguageCode;
}

export const WonderCard = ({ question, translation, language }: Props) => (
  <View style={styles.card}>
    <Text style={styles.label}>WONDER</Text>
    <View style={styles.row}>
      <Text style={styles.question}>{question}</Text>
      <AudioButton text={question} language={language} size="sm" />
    </View>
    <Text style={styles.translation}>{translation}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.accentLight,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  question: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
    lineHeight: 28,
  },
  translation: {
    fontSize: 14,
    color: theme.colors.accentLight,
  },
});
