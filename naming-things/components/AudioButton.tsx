import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { speak } from '@/services/audio';
import type { LanguageCode } from '@/types';

interface Props {
  text: string;
  language: LanguageCode;
  size?: 'sm' | 'md';
}

export const AudioButton = ({ text, language, size = 'md' }: Props) => {
  const dimension = size === 'sm' ? 32 : 40;
  return (
    <Pressable
      onPress={() => speak(text, language, 'normal')}
      accessibilityRole="button"
      accessibilityLabel={`Play pronunciation of ${text}`}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Text style={[styles.icon, size === 'sm' && styles.iconSm]}>♪</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: theme.colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  iconSm: {
    fontSize: 14,
  },
});
