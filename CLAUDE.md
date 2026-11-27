# unicodemaxxer – notes for Claude

Read this first. Both Magnus and Gregers work on this repo with their own Claude
Code. This file is how your two Claudes stay on the same page.

## What it is

A typing-practice site for **Word's equation format** (UnicodeMath / "linear
format"): you see a rendered formula, you type it the way you'd type it in Word
(`x\bar=1/n \sum_(i=1)^n x_i`), it checks the result and moves on.
Built for HA students at CBS: only formulas from **statistics, microeconomics
and macroeconomics**, each in three levels (basic / mid / exam).

The humans speak Danish. Answer them in Danish; code, comments and commit
messages in English.

## Non-negotiables

1. **It must not look AI-made.** No gradients, glassmorphism, rounded cards,
   drop shadows, emoji, icon packs (lucide etc.), Tailwind default look, Inter,
   purple, "hero sections", or marketing copy. The look is "a Word document":
   white page, Cambria, Wikipedia-blue links, black rules, lowercase. If unsure,
   make it plainer.
2. **Simple.** One thing on screen at a time. Don't add features nobody asked for.
3. **Own thing.** Inspired by typing sites, but not a copy of any of them.
4. **Formulas stay on-syllabus.** No random proofs or matrices nobody uses.
5. **Accept what Word accepts.** If it builds up correctly in Word, it should
   count as correct here.

## Stack

- Vite + React + TypeScript, plain CSS (`src/styles.css`). No UI library.
- Our own UnicodeMath parser in `src/umath/` – renders to native MathML.
- Race mode is peer-to-peer (PeerJS, free public signalling server). No backend.
- Hosted on GitHub Pages, deployed automatically on every push to `main`
  (`.github/workflows/deploy.yml`).

```
npm install
npm run dev      # local dev server
npm test         # parser + formula bank tests – must pass before pushing
npm run build    # type-check + production build
```

## Map

| path | what |
|---|---|
| `src/umath/parse.ts` | Word linear format → tree. Tolerant of half-typed input. |
| `src/umath/render.ts` | tree → MathML |
| `src/umath/compare.ts` | canonical form + `matches()` – decides right/wrong |
| `src/umath/controlWords.ts` | `\alpha` → α etc. Add control words here. |
| `src/data/formulas.ts` | **the formula bank.** Add formulas here. |
| `src/components/Run.tsx` | one round of typing (used by practice and race) |
| `src/pages/*` | practice, race, how-to-type, your bests |

## How matching works

`canonical()` turns input into a structure string (fractions, scripts, accents,
roots, n-ary). Two inputs match if their structures match – so `x_i^2` equals
`x^2_i`, extra spaces don't matter, `▒` after `\sum` is optional. Control words
are tried both ways (Word eats the space after `\alpha`; people sometimes type
an extra one). When you change the parser, add a test in `src/umath/umath.test.ts`.

## Working together without stepping on each other

- **Never commit straight to `main`.** Make a branch (`magnus/…` or
  `gregers/…`), open a pull request, merge when `npm test` and `npm run build`
  pass. Merging to `main` = it goes live.
- Pull `main` before starting anything.
- Keep pull requests small and about one thing.
- Areas (agreed split – change it here if you change it):
  - **Magnus:** formula bank (`src/data/`), how-to-type page, overall look.
  - **Gregers:** race / multiplayer (`src/pages/Race.tsx`), leaderboards.
  - **Shared, ask first:** `src/umath/` (the parser), `src/components/Run.tsx`,
    `src/styles.css`.

## Ideas parked for later

- Global leaderboard (needs a small backend, e.g. Supabase free tier)
- More subjects (finansiering, økonomistyring) once the first three feel right
- Word-style autocorrect inside the input box (show α as soon as you type `\alpha `)
