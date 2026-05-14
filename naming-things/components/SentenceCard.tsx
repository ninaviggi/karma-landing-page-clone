import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { LanguageCode } from '@/types';
import { AudioButton } from './AudioButton';

interface Props {
  sentence: string;
  translation: string;
  context: string;
  language: LanguageCode;
}

export const SentenceCard = ({
  sentence,
  translation,
  context,
  language,
}: Props) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.sentence}>“{sentence}”</Text>
      <AudioButton text={sentence} language={language} size="sm" />
    </View>
    <Text style={styles.translation}>{translation}</Text>
    {context ? <Text style={styles.context}>· {context}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  sentence: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: theme.colors.text,
    lineHeight: 24,
  },
  translation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  context: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});
