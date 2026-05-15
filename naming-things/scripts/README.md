# scripts/

Dev tooling that runs against `core/` directly — no Expo, no SQLite, no UI. Useful for sanity-checking the AI flow before wiring it into the app.

## test-generate.ts

Calls Claude with the exact prompts the mobile app uses and reports back: schema validation, repeat-vocab overlap, timing. Saves the full JSON for each sample to `scripts/output/`.

### Setup

```bash
cd naming-things
npm install
export CLAUDE_API_KEY=sk-ant-...   # or ANTHROPIC_API_KEY
```

### Run

```bash
# All default samples (5 scenarios: fresh + repeat in 4 languages)
npm run test-generate

# Single custom sample: activity, learning lang, child age
npm run test-generate -- "draw a dragon" fr 5

# With previous vocabulary (comma-separated)
npm run test-generate -- "bake cookies" fr 4 en "la farine" "le sucre"
```

### What it checks

- **Schema shape:** 6-8 vocab, 3-5 sentences, 4-6 steps, wonder question complete
- **Field completeness:** every vocab item has word/translation/phonetic; every step has instruction/languagePrompt/translation
- **Repeat progression:** when `previousVocabulary` is non-empty, flags if the new activity reuses more than 50% of those words (spec says ≥50% should be new)
- **Roundtrip time:** how long each call takes

### Output

```
[1/5] FR · "bake chocolate chip cookies"
    ✓ 3421ms
    title: Baking cookies together
    vocab (8): la farine → flour · le sucre → sugar · ...
    sentences (4):
      · "Mets la farine dans le bol." — Put the flour in the bowl.
        when: When your child adds flour
      ...
    steps (5):
      1. Measure flour and sugar into the big bowl.
          → "Combien de farine?" — How much flour?
      ...
    wonder: "Si on pouvait inventer un nouveau goût..." — ...

[2/5] FR · "bake chocolate chip cookies" · repeat
    ✓ 2980ms
    ...
    · repeat-vocab overlap: 2/7 (29%) — la farine, le four
```

Full JSON saved to `scripts/output/1-cookies-fr-fresh.json` etc.
