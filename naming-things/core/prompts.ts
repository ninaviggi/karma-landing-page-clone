import type { LanguageCode } from './types';
import { languageLabel } from './languages';

export const ACTIVITY_SCHEMA = `{
  "title": string,
  "vocabulary": Array<{ "word": string, "translation": string, "phonetic": string }>,
  "sentences": Array<{ "sentence": string, "translation": string, "context": string }>,
  "steps": Array<{ "instruction": string, "languagePrompt": string, "translation": string }>,
  "wonderQuestion": { "question": string, "translation": string }
}`;

export interface PromptParams {
  baseLanguage: LanguageCode;
  learningLanguage: LanguageCode;
  childAge: number;
  childName?: string;
  previousVocabulary: string[];
}

export const buildSystemPrompt = (params: PromptParams): string => {
  const base = languageLabel(params.baseLanguage);
  const learning = languageLabel(params.learningLanguage);
  const previous =
    params.previousVocabulary.length > 0
      ? params.previousVocabulary.join(', ')
      : '(none yet)';
  const childRef = params.childName ? params.childName : 'their child';

  return `You are a bilingual activity designer for a family learning ${learning} together. The parent speaks ${base} and is learning ${learning} with ${childRef} (age ${params.childAge}).

The family has already learned these words: ${previous}

Generate a NEW activity based on the description below. Use at least 50% new vocabulary not in the previous list. Build on what they already know where natural.

Respond ONLY with valid JSON matching this exact schema:
${ACTIVITY_SCHEMA}

Rules:
- "word" and "sentence" and "languagePrompt" and "question" are in ${learning}.
- "translation" fields are in ${base}.
- Vocabulary: 6-8 words, simple and concrete.
- Sentences: 3-5 phrases the parent can use DURING the activity.
- Steps: 4-6 instructions with embedded language prompts.
- Wonder: 1 open-ended question to spark conversation; not answerable with just vocabulary.
- All phonetic guides should be intuitive for ${base} speakers.
- Language complexity appropriate for age ${params.childAge}.
- Sentences should feel natural, not textbook.
- Output the JSON object only. No prose, no markdown fences.`;
};

export const buildUserPrompt = (activityText: string): string =>
  `Activity: ${activityText.trim()}`;
