import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import type { SuggestionItem } from '@/constants/suggestions';

interface Props {
  title: string;
  subtitle: string;
  items: SuggestionItem[];
  onSelect: (text: string) => void;
}

export const ActivityRow = ({ title, subtitle, items, onSelect }: Props) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
      snapToInterval={232}
    >
      {items.map((item, i) => (
        <Tile
          key={`${item.title}-${i}`}
          item={item}
          onPress={() => onSelect(item.title)}
        />
      ))}
    </ScrollView>
  </View>
);

interface TileProps {
  item: SuggestionItem;
  onPress: () => void;
}

const Tile = ({ item, onPress }: TileProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.tile,
      item.featured && styles.tileFeatured,
      pressed && styles.tilePressed,
    ]}
  >
    <Text
      style={[styles.tileTitle, item.featured && styles.tileTitleFeatured]}
      numberOfLines={3}
    >
      {item.title}
    </Text>
    <View style={styles.tileFoot}>
      <Text
        style={[styles.tileMeta, item.featured && styles.tileMetaFeatured]}
        numberOfLines={1}
      >
        {item.meta ?? ' '}
      </Text>
      <Text
        style={[styles.tileArrow, item.featured && styles.tileArrowFeatured]}
        accessibilityElementsHidden
      >
        →
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.md,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },
  row: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  tile: {
    width: 220,
    minHeight: 140,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  tileFeatured: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  tilePressed: {
    backgroundColor: theme.colors.surface,
  },
  tileTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  tileTitleFeatured: {
    color: theme.colors.white,
  },
  tileFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileMeta: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    flex: 1,
  },
  tileMetaFeatured: {
    color: theme.colors.accentLight,
  },
  tileArrow: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },
  tileArrowFeatured: {
    color: theme.colors.accentLight,
  },
});
