import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { LanguageCode } from '@core/index';
import { AudioButton } from './AudioButton';

interface Props {
  word: string;
  translation: string;
  phonetic: string;
  language: LanguageCode;
}

export const VocabCard = ({ word, translation, phonetic, language }: Props) => (
  <View style={styles.card}>
    <View style={styles.textBlock}>
      <Text style={styles.word} numberOfLines={2}>
        {word}
      </Text>
      <Text style={styles.translation} numberOfLines={1}>
        {translation}
      </Text>
      <Text style={styles.phonetic} numberOfLines={1}>
        {phonetic}
      </Text>
    </View>
    <AudioButton text={word} language={language} size="sm" />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    minHeight: 96,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  word: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  translation: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  phonetic: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.mono.fontFamily,
    marginTop: 2,
  },
});
