export type CharacterItem = {
	char: string;
	romaji: string;
};

export type SpecialCharacterItem = {
	hiragana: string;
	katakana: string;
	romaji: string;
	base?: string;
	example: string;
	exampleHira: string;
	exampleKata: string;
};

export type VocabItem = {
	id: number;
	kanji: string;
	hiragana: string;
	romaji: string;
	meaning: string;
	category: string;
	example: string;
	exampleRomaji: string;
	exampleMeaning: string;
};

export type HiraganaData = { rows: Record<string, CharacterItem[]> };
export type KatakanaData = { rows: Record<string, CharacterItem[]> };
export type SpecialData = Record<string, SpecialCharacterItem[]>;
export type VocabData = { words: VocabItem[] };

let hiraganaCache: HiraganaData | null = null;
let katakanaCache: KatakanaData | null = null;
let specialCache: SpecialData | null = null;
const vocabCache = new Map<JlptLevel, VocabData>();

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export async function getHiragana(): Promise<HiraganaData> {
	if (!hiraganaCache) {
		hiraganaCache = (await import('../../data/hiragana.json')).default as HiraganaData;
	}
	return hiraganaCache;
}

export async function getKatakana(): Promise<KatakanaData> {
	if (!katakanaCache) {
		katakanaCache = (await import('../../data/katakana.json')).default as KatakanaData;
	}
	return katakanaCache;
}

export async function getSpecialCharacters(): Promise<SpecialData> {
	if (!specialCache) {
		specialCache = (await import('../../data/special-characters.json')).default as SpecialData;
	}
	return specialCache;
}

const vocabImports: Record<JlptLevel, () => Promise<{ default: VocabData }>> = {
	N5: () => import('../../data/n5-vocab.json') as Promise<{ default: VocabData }>,
	N4: () => import('../../data/n4-vocab.json') as Promise<{ default: VocabData }>,
	N3: () => import('../../data/n3-vocab.json') as Promise<{ default: VocabData }>,
	N2: () => import('../../data/n2-vocab.json') as Promise<{ default: VocabData }>,
	N1: () => import('../../data/n1-vocab.json') as Promise<{ default: VocabData }>
};

export async function getVocabulary(level: JlptLevel = 'N5'): Promise<VocabData> {
	let cached = vocabCache.get(level);
	if (!cached) {
		cached = (await vocabImports[level]()).default;
		vocabCache.set(level, cached);
	}
	return cached;
}

export const ROW_LABELS: Record<string, string> = {
	a: 'A-row (あ)',
	ka: 'Ka-row (か)',
	sa: 'Sa-row (さ)',
	ta: 'Ta-row (た)',
	na: 'Na-row (な)',
	ha: 'Ha-row (は)',
	ma: 'Ma-row (ま)',
	ya: 'Ya-row (や)',
	ra: 'Ra-row (ら)',
	wa: 'Wa-row (わ)'
};

export const SPECIAL_LABELS: Record<string, string> = {
	dakuten: 'Dakuten (濁点)',
	handakuten: 'Handakuten (半濁点)',
	youon: 'Youon (拗音)',
	sokuon: 'Sokuon (促音)',
	chouon: 'Chouon (長音)'
};
