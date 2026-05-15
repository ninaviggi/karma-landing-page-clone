/**
 * Test harness for the Claude generation flow.
 *
 * Calls core/ai.ts with the same prompts the mobile app uses and prints
 * a compact report per sample plus the full JSON to scripts/output/.
 *
 * Run:
 *   npm run test-generate                                     # all default samples
 *   npm run test-generate -- "draw a dragon" fr 5             # single custom run
 *
 * Env:
 *   CLAUDE_API_KEY (or ANTHROPIC_API_KEY) must be set.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateActivity } from '../core/ai';
import { buildSystemPrompt, buildUserPrompt } from '../core/prompts';
import type { GeneratedActivity, LanguageCode } from '../core/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Sample {
  label: string;
  activityText: string;
  baseLanguage: LanguageCode;
  learningLanguage: LanguageCode;
  childAge: number;
  childName?: string;
  previousVocabulary: string[];
}

const COOKIES_FIRST_VOCAB = [
  'la farine',
  'le sucre',
  "l'œuf",
  'le beurre',
  'le bol',
  'mélanger',
  'la pâte',
  'le four',
];

const DEFAULT_SAMPLES: Sample[] = [
  {
    label: 'cookies-fr-fresh',
    activityText: 'bake chocolate chip cookies',
    baseLanguage: 'en',
    learningLanguage: 'fr',
    childAge: 4,
    childName: 'Maya',
    previousVocabulary: [],
  },
  {
    label: 'cookies-fr-repeat',
    activityText: 'bake chocolate chip cookies',
    baseLanguage: 'en',
    learningLanguage: 'fr',
    childAge: 4,
    childName: 'Maya',
    previousVocabulary: COOKIES_FIRST_VOCAB,
  },
  {
    label: 'dragon-es-fresh',
    activityText: 'draw a dragon',
    baseLanguage: 'en',
    learningLanguage: 'es',
    childAge: 5,
    previousVocabulary: [],
  },
  {
    label: 'table-it-fresh',
    activityText: 'set the table for dinner',
    baseLanguage: 'en',
    learningLanguage: 'it',
    childAge: 6,
    previousVocabulary: [],
  },
  {
    label: 'pillowfort-de-fresh',
    activityText: 'build a pillow fort',
    baseLanguage: 'en',
    learningLanguage: 'de',
    childAge: 3,
    previousVocabulary: [],
  },
];

interface ValidationReport {
  issues: string[];
  vocabOverlap: {
    count: number;
    items: string[];
    ratio: number;
    exceedsThreshold: boolean;
  };
  durationMs: number;
}

const validate = (
  activity: GeneratedActivity,
  previous: string[]
): Omit<ValidationReport, 'durationMs'> => {
  const issues: string[] = [];

  if (!activity.title) issues.push('missing title');
  if (activity.vocabulary.length < 6 || activity.vocabulary.length > 8) {
    issues.push(
      `vocabulary count = ${activity.vocabulary.length}, expected 6-8`
    );
  }
  if (activity.sentences.length < 3 || activity.sentences.length > 5) {
    issues.push(`sentences count = ${activity.sentences.length}, expected 3-5`);
  }
  if (activity.steps.length < 4 || activity.steps.length > 6) {
    issues.push(`steps count = ${activity.steps.length}, expected 4-6`);
  }
  for (const v of activity.vocabulary) {
    if (!v.word || !v.translation || !v.phonetic) {
      issues.push(`vocab item missing fields: ${JSON.stringify(v)}`);
    }
  }
  for (const s of activity.sentences) {
    if (!s.sentence || !s.translation) {
      issues.push(`sentence item missing fields: ${JSON.stringify(s)}`);
    }
  }
  for (const step of activity.steps) {
    if (!step.instruction || !step.languagePrompt || !step.translation) {
      issues.push(`step missing fields: ${JSON.stringify(step)}`);
    }
  }
  if (
    !activity.wonderQuestion?.question ||
    !activity.wonderQuestion?.translation
  ) {
    issues.push('wonderQuestion incomplete');
  }

  const overlap = activity.vocabulary
    .filter((v) => previous.includes(v.word))
    .map((v) => v.word);
  const ratio =
    previous.length === 0 ? 0 : overlap.length / activity.vocabulary.length;

  return {
    issues,
    vocabOverlap: {
      count: overlap.length,
      items: overlap,
      ratio,
      exceedsThreshold: previous.length > 0 && ratio > 0.5,
    },
  };
};

const truncate = (s: string, n: number): string =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

const pad = (s: string, n: number): string =>
  s.length >= n ? s : `${s}${' '.repeat(n - s.length)}`;

const printActivity = (activity: GeneratedActivity, indent = '    '): void => {
  console.log(`${indent}title: ${activity.title}`);
  console.log(
    `${indent}vocab (${activity.vocabulary.length}): ${activity.vocabulary
      .map((v) => `${v.word} → ${v.translation}`)
      .join(' · ')}`
  );
  console.log(`${indent}sentences (${activity.sentences.length}):`);
  for (const s of activity.sentences) {
    console.log(`${indent}  · "${s.sentence}" — ${s.translation}`);
    if (s.context) console.log(`${indent}    when: ${s.context}`);
  }
  console.log(`${indent}steps (${activity.steps.length}):`);
  activity.steps.forEach((step, i) => {
    console.log(`${indent}  ${pad(`${i + 1}.`, 3)} ${step.instruction}`);
    console.log(
      `${indent}      → "${step.languagePrompt}" — ${step.translation}`
    );
  });
  console.log(
    `${indent}wonder: "${activity.wonderQuestion.question}" — ${activity.wonderQuestion.translation}`
  );
};

const runSample = async (
  sample: Sample,
  apiKey: string
): Promise<{
  ok: true;
  activity: GeneratedActivity;
  validation: ValidationReport;
} | { ok: false; error: string }> => {
  const t0 = Date.now();
  try {
    const activity = await generateActivity({
      activityText: sample.activityText,
      baseLanguage: sample.baseLanguage,
      learningLanguage: sample.learningLanguage,
      childAge: sample.childAge,
      childName: sample.childName,
      previousVocabulary: sample.previousVocabulary,
      apiKey,
    });
    const durationMs = Date.now() - t0;
    const validation = { ...validate(activity, sample.previousVocabulary), durationMs };
    return { ok: true, activity, validation };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
};

interface CliOptions {
  samples: Sample[];
  dryRun: boolean;
}

const parseCli = (): CliOptions => {
  const raw = process.argv.slice(2);
  const dryRun = raw.includes('--dry-run');
  const args = raw.filter((a) => !a.startsWith('--'));

  if (args.length === 0) return { samples: DEFAULT_SAMPLES, dryRun };

  const [activityText, learningLanguage = 'fr', childAgeRaw = '4', baseLanguage = 'en', ...prev] = args;
  const sample: Sample = {
    label: 'cli-custom',
    activityText,
    baseLanguage: baseLanguage as LanguageCode,
    learningLanguage: learningLanguage as LanguageCode,
    childAge: parseInt(childAgeRaw, 10) || 4,
    previousVocabulary: prev,
  };
  return { samples: [sample], dryRun };
};

const printDryRun = (sample: Sample): void => {
  console.log('─'.repeat(60));
  console.log(`SAMPLE: ${sample.label}`);
  console.log('─'.repeat(60));
  console.log('SYSTEM PROMPT:');
  console.log(
    buildSystemPrompt({
      baseLanguage: sample.baseLanguage,
      learningLanguage: sample.learningLanguage,
      childAge: sample.childAge,
      childName: sample.childName,
      previousVocabulary: sample.previousVocabulary,
    })
  );
  console.log('');
  console.log('USER PROMPT:');
  console.log(buildUserPrompt(sample.activityText));
  console.log('');
};

const main = async (): Promise<void> => {
  const { samples, dryRun } = parseCli();

  if (dryRun) {
    console.log(`Dry run: printing prompts for ${samples.length} sample${samples.length === 1 ? '' : 's'}.\n`);
    for (const s of samples) printDryRun(s);
    return;
  }

  const apiKey =
    process.env.CLAUDE_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.EXPO_PUBLIC_CLAUDE_API_KEY ||
    '';

  if (!apiKey) {
    console.error(
      'Missing API key. Set CLAUDE_API_KEY (or ANTHROPIC_API_KEY) and re-run.\nTip: pass --dry-run to inspect prompts without an API call.'
    );
    process.exit(1);
  }

  const outDir = join(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });

  console.log(`Running ${samples.length} sample${samples.length === 1 ? '' : 's'}...\n`);

  let okCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const tag = `[${i + 1}/${samples.length}]`;
    const repeat = s.previousVocabulary.length > 0 ? ' · repeat' : '';
    console.log(`${tag} ${s.learningLanguage.toUpperCase()} · "${truncate(s.activityText, 40)}"${repeat}`);

    const result = await runSample(s, apiKey);

    if (!result.ok) {
      console.log(`    ✗ ${result.error}`);
      failCount += 1;
      console.log('');
      continue;
    }

    const { activity, validation } = result;
    console.log(`    ✓ ${validation.durationMs}ms`);
    printActivity(activity);

    if (s.previousVocabulary.length > 0) {
      const pct = Math.round(validation.vocabOverlap.ratio * 100);
      const marker = validation.vocabOverlap.exceedsThreshold ? '⚠' : '·';
      console.log(
        `    ${marker} repeat-vocab overlap: ${validation.vocabOverlap.count}/${activity.vocabulary.length} (${pct}%) — ${validation.vocabOverlap.items.join(', ') || 'none'}`
      );
    }

    if (validation.issues.length > 0) {
      console.log(`    ⚠ ${validation.issues.length} schema issue(s):`);
      for (const issue of validation.issues) console.log(`      - ${issue}`);
      warnCount += 1;
    } else if (!validation.vocabOverlap.exceedsThreshold) {
      okCount += 1;
    } else {
      warnCount += 1;
    }

    const filename = `${i + 1}-${s.label}.json`;
    writeFileSync(
      join(outDir, filename),
      JSON.stringify(
        { input: s, output: activity, validation },
        null,
        2
      )
    );
    console.log('');
  }

  console.log('─'.repeat(60));
  console.log(`Summary: ${okCount} clean · ${warnCount} warnings · ${failCount} failed`);
  console.log(`Full JSON saved to ${outDir}/`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
