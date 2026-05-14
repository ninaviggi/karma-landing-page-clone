import { StyleSheet, Text, View } from 'react-native';
import { ActivityList } from './ActivityList';
import { theme } from '@/constants/theme';

interface Props {
  title: string;
  subtitle: string;
  items: string[];
  onSelect: (text: string) => void;
}

export const CategorySection = ({ title, subtitle, items, onSelect }: Props) => (
  <View style={styles.section}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <ActivityList items={items} onSelect={onSelect} />
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.md,
  },
  header: {
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
});
