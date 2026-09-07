# Japanese Flashcard Learning App

## Project Overview

Static SvelteKit app for studying Japanese characters (Hiragana, Katakana, special characters) and JLPT vocabulary (N5-N1). Deployed to GitHub Pages.

## Tech Stack

- **Framework**: SvelteKit with `@sveltejs/adapter-static`
- **Language**: TypeScript (strict mode)
- **Svelte**: v5 runes mode (`$state`, `$derived`, `$effect`, `$props`) — do NOT use legacy `let` reactivity or `$:` syntax
- **Styling**: Tailwind CSS 4 with class-based dark mode via `@custom-variant dark (&:where(.dark, .dark *))`
- **Package Manager**: pnpm

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build (outputs to `build/`)
- `pnpm check` — type check with svelte-check
- `pnpm lint` — prettier + eslint check
- `pnpm format` — auto-format with prettier

## Project Structure

```
src/
  data/              # JSON data files (hiragana, katakana, special-characters, n1-n5 vocab)
  lib/
    components/      # Svelte components (CharacterQuiz, VocabularyQuiz, QuizCard, ModeSelector, Navigation)
    stores/          # Svelte writable stores (quizStore.ts)
    utils/           # Data loading (dataLoader.ts), quiz logic (quizLogic.ts)
  routes/            # SvelteKit routes (+page.svelte, +layout.svelte, layout.css)
```

## Architecture Decisions

- **Lazy loading**: All JSON data is loaded via dynamic `import()` with in-memory caching in `dataLoader.ts`. Do not use static imports for data files.
- **No localStorage for scores**: Only dark mode preference is persisted. Quiz progress resets on page reload.
- **Wrong answer re-insertion**: Wrong answers are re-queued up to 3 times at random positions ahead in the queue.
- **Multi-select dropdowns**: Character rows and JLPT levels use custom dropdown components with checkmarks (not native `<select multiple>`).
- **Vocabulary correct answers**: Show example sentence with manual "Next" button. Wrong answers auto-advance after 1.2s with no example shown.

## Coding Conventions

- Tabs for indentation, single quotes, no trailing commas
- Tailwind classes for all styling — no separate CSS files except `layout.css` for global setup
- Dark mode: always include `dark:` variants for all visual styles
- Components use Svelte 5 `$props()` for inputs, not `export let`
- Store subscriptions in components use `$state` + `.subscribe()` pattern

## Data Format

Vocab JSON files follow this structure:
```json
{
  "words": [
    {
      "id": 1, "kanji": "食べる", "hiragana": "たべる", "romaji": "taberu",
      "meaning": "to eat", "example": "毎日ご飯を食べます",
      "exampleRomaji": "Mainichi gohan o tabemasu",
      "exampleMeaning": "I eat rice every day"
    }
  ]
}
```

N4, N3, N2, N1 vocab files contain placeholder data — populate with the same structure.

## GitHub Pages Deployment

- `vite.config.ts` sets `paths.base` from `BASE_PATH` env var (empty in dev)
- GitHub Actions workflow sets `BASE_PATH=/${{ github.event.repository.name }}`
- Static adapter generates `404.html` as fallback
