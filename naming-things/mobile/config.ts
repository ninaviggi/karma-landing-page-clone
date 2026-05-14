import Constants from 'expo-constants';

export const getClaudeApiKey = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
  const fromExtra = Constants.expoConfig?.extra?.claudeApiKey as
    | string
    | undefined;
  return fromEnv || fromExtra || '';
};
