import type { GeneratedActivity } from './types';
import {
  buildSystemPrompt,
  buildUserPrompt,
  type PromptParams,
} from './prompts';

const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-6';

export interface GenerateArgs extends PromptParams {
  activityText: string;
  apiKey: string;
  model?: string;
}

export class AIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AIError';
  }
}

const extractJson = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }
  return trimmed;
};

const validateActivity = (raw: unknown): GeneratedActivity => {
  if (!raw || typeof raw !== 'object') {
    throw new AIError('AI response was not an object');
  }
  const obj = raw as Record<string, unknown>;
  const required = ['title', 'vocabulary', 'sentences', 'steps', 'wonderQuestion'];
  for (const key of required) {
    if (!(key in obj)) {
      throw new AIError(`AI response missing field: ${key}`);
    }
  }
  if (!Array.isArray(obj.vocabulary) || obj.vocabulary.length === 0) {
    throw new AIError('AI response had no vocabulary');
  }
  if (!Array.isArray(obj.sentences) || obj.sentences.length === 0) {
    throw new AIError('AI response had no sentences');
  }
  if (!Array.isArray(obj.steps) || obj.steps.length === 0) {
    throw new AIError('AI response had no steps');
  }
  return obj as unknown as GeneratedActivity;
};

export const generateActivity = async (
  args: GenerateArgs
): Promise<GeneratedActivity> => {
  if (!args.apiKey) {
    throw new AIError('Claude API key is required');
  }

  const system = buildSystemPrompt(args);
  const user = buildUserPrompt(args.activityText);

  let response: Response;
  try {
    response = await fetch(CLAUDE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': args.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: args.model ?? DEFAULT_MODEL,
        max_tokens: 2048,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    });
  } catch (err) {
    throw new AIError('Network error calling Claude API', err);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new AIError(
      `Claude API error ${response.status}: ${text.slice(0, 200)}`
    );
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = data.content?.find((c) => c.type === 'text');
  if (!textBlock?.text) {
    throw new AIError('Claude API returned no text content');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(textBlock.text));
  } catch (err) {
    throw new AIError('Could not parse JSON from Claude response', err);
  }

  return validateActivity(parsed);
};
