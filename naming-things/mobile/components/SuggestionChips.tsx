import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export const SuggestionChips = ({ suggestions, onSelect }: Props) => (
  <View style={styles.wrap}>
    {suggestions.map((s) => (
      <Pressable
        key={s}
        onPress={() => onSelect(s)}
        style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      >
        <Text style={styles.text}>{s}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pressed: {
    backgroundColor: theme.colors.surfaceHover,
  },
  text: {
    fontSize: 14,
    color: theme.colors.text,
  },
});
