import { writable } from 'svelte/store';

export type QuizMode = 'hiragana' | 'katakana' | 'combined';
export type ActiveTab = 'character' | 'vocabulary';

function createPersistent<T>(key: string, initial: T) {
	let stored: T = initial;
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem(key);
			if (raw) stored = JSON.parse(raw);
		} catch {
			/* ignore */
		}
	}
	const store = writable<T>(stored);
	store.subscribe((val) => {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(key, JSON.stringify(val));
			} catch {
				/* ignore */
			}
		}
	});
	return store;
}

export const activeTab = writable<ActiveTab>('character');
export const quizMode = writable<QuizMode>('hiragana');
export const selectedRows = writable<string[]>(['a']);
export const selectedSpecials = writable<string[]>([]);
export const selectedLevels = writable<('N5' | 'N4' | 'N3' | 'N2' | 'N1')[]>(['N5']);
export const darkMode = createPersistent<boolean>('jp-dark-mode', false);
