# Agent Instructions

## Before Making Changes

1. Run `pnpm check` to verify current state compiles
2. Read the relevant files before editing — understand existing patterns

## After Making Changes

1. Run `pnpm check` — must pass with 0 errors, 0 warnings
2. Run `pnpm lint` — fix any formatting issues with `pnpm format`
3. Test in browser with `pnpm dev` for UI/UX changes

## Rules

- Use Svelte 5 runes mode only: `$state`, `$derived`, `$effect`, `$props`. Never use `$:`, `export let`, or `on:event` syntax.
- Use Tailwind CSS classes exclusively. Always add `dark:` variants.
- Load data through `dataLoader.ts` async functions — never import JSON directly in components.
- Keep quiz state local to components. Only shared UI state (dark mode, selected mode/rows/levels) goes in `quizStore.ts`.
- Do not add localStorage persistence for quiz scores or progress.
- Do not add new dependencies without explicit approval.
- Maintain the existing multi-select dropdown pattern (checkmarks, click-outside, summary text) for any new selection UIs.
