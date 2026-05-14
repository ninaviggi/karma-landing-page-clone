import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export type Mode = 'screen' | 'audio';

interface Props {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export const ModeToggle = ({ value, onChange }: Props) => (
  <View style={styles.wrap}>
    <ToggleButton
      label="Screen"
      active={value === 'screen'}
      onPress={() => onChange('screen')}
    />
    <ToggleButton
      label="Audio"
      active={value === 'audio'}
      onPress={() => onChange('audio')}
    />
  </View>
);

const ToggleButton = ({
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
    style={[styles.button, active && styles.buttonActive]}
  >
    <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    padding: 4,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  buttonActive: {
    backgroundColor: theme.colors.white,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  labelActive: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});
