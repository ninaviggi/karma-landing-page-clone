import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';

interface Props {
  onGenerate: (text: string) => void;
  loading?: boolean;
}

export const GenerateInput = ({ onGenerate, loading }: Props) => {
  const [text, setText] = useState('');
  const canSubmit = text.trim().length > 1 && !loading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onGenerate(text.trim());
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type what we're doing..."
        placeholderTextColor={theme.colors.textTertiary}
        style={styles.input}
        multiline
        editable={!loading}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <View style={styles.footer}>
        <Text style={styles.hint}>e.g. bake cookies, draw a dragon</Text>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.button,
            !canSubmit && styles.buttonDisabled,
            pressed && canSubmit && styles.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Generate →</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  input: {
    fontSize: 17,
    color: theme.colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  hint: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.radius.full,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surfaceHover,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
