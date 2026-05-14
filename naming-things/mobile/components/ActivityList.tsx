import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  items: string[];
  onSelect: (text: string) => void;
}

export const ActivityList = ({ items, onSelect }: Props) => (
  <View style={styles.list}>
    {items.map((item, index) => (
      <Pressable
        key={item}
        onPress={() => onSelect(item)}
        style={({ pressed }) => [
          styles.item,
          index === items.length - 1 && styles.itemLast,
          pressed && styles.itemPressed,
        ]}
      >
        <Text style={styles.title}>{item}</Text>
        <Text style={styles.arrow} accessibilityElementsHidden>
          →
        </Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemPressed: {
    backgroundColor: theme.colors.surface,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: theme.colors.text,
    lineHeight: 22,
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.textTertiary,
  },
});
