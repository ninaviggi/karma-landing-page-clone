import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { LANGUAGES, type LanguageCode } from '@core/index';
import { useUserStore } from '@/stores/userStore';

const AGES = [3, 4, 5, 6, 7];

export default function Onboarding() {
  const router = useRouter();
  const setPreferences = useUserStore((s) => s.setPreferences);

  const [baseLanguage] = useState<LanguageCode>('en');
  const [learningLanguage, setLearningLanguage] = useState<LanguageCode>('fr');
  const [childAge, setChildAge] = useState<number>(4);
  const [childName, setChildName] = useState('');

  const learningOptions = LANGUAGES.filter((l) => l.code !== baseLanguage);

  const handleStart = async () => {
    await setPreferences({
      baseLanguage,
      learningLanguage,
      childAge,
      childName: childName.trim() || undefined,
      onboarded: true,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.kicker}>NAMING THINGS</Text>
          <Text style={styles.title}>
            Learn a language while you live your life with your child.
          </Text>
          <Text style={styles.subtitle}>
            Tell the app what you're about to do together. It writes the words
            and phrases. You bring the moment.
          </Text>
        </View>

        <Field label="Learning">
          <View style={styles.optionRow}>
            {learningOptions.slice(0, 7).map((l) => (
              <Pressable
                key={l.code}
                onPress={() => setLearningLanguage(l.code)}
                style={[
                  styles.option,
                  learningLanguage === l.code && styles.optionActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    learningLanguage === l.code && styles.optionTextActive,
                  ]}
                >
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Child's age">
          <View style={styles.optionRow}>
            {AGES.map((age) => (
              <Pressable
                key={age}
                onPress={() => setChildAge(age)}
                style={[
                  styles.option,
                  childAge === age && styles.optionActive,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    childAge === age && styles.optionTextActive,
                  ]}
                >
                  {age}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Child's name (optional)">
          <TextInput
            value={childName}
            onChangeText={setChildName}
            placeholder="e.g. Maya"
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.input}
          />
        </Field>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>Begin</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  field: {
    gap: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  option: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  optionTextActive: {
    color: theme.colors.white,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cta: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
