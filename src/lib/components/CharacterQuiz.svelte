<script lang="ts">
	import { quizMode, selectedRows, selectedSpecials } from '$lib/stores/quizStore';
	import type { QuizMode } from '$lib/stores/quizStore';
	import {
		getHiragana,
		getKatakana,
		getSpecialCharacters,
		type CharacterItem,
		type SpecialCharacterItem,
		type HiraganaData,
		type KatakanaData,
		type SpecialData
	} from '$lib/utils/dataLoader';
	import { shuffle, generateOptions } from '$lib/utils/quizLogic';
	import ModeSelector from './ModeSelector.svelte';
	import QuizCard from './QuizCard.svelte';

	let hiragana: HiraganaData | null = $state(null);
	let katakana: KatakanaData | null = $state(null);
	let special: SpecialData | null = $state(null);
	let loading = $state(false);

	let mode: QuizMode = $state('hiragana');
	let rows: string[] = $state(['a']);
	let specials: string[] = $state([]);
	quizMode.subscribe((v) => (mode = v));
	selectedRows.subscribe((v) => (rows = v));
	selectedSpecials.subscribe((v) => (specials = v));

	type QuizItem = {
		display: string;
		romaji: string;
		example?: string;
		exampleDisplay?: string;
	};

	type WrongItem = { display: string; romaji: string };

	let items: QuizItem[] = $state([]);
	let queue: QuizItem[] = $state([]);
	let currentIndex = $state(0);
	let wrongCounts: Map<string, number> = $state(new Map());
	let wrongItems: Map<string, WrongItem> = $state(new Map());
	let roundCorrect = $state(0);
	let roundTotal = $state(0);
	let quizDone = $state(false);
	let quizStarted = $state(false);
	let allRomaji: string[] = $state([]);
	let timerDuration = $state(5);

	async function loadData() {
		loading = true;
		const needHiragana = mode === 'hiragana' || mode === 'combined';
		const needKatakana = mode === 'katakana' || mode === 'combined';
		const needSpecial = specials.length > 0 || mode === 'combined';

		const promises: Promise<unknown>[] = [];
		if (needHiragana && !hiragana) promises.push(getHiragana().then((d) => (hiragana = d)));
		if (needKatakana && !katakana) promises.push(getKatakana().then((d) => (katakana = d)));
		if (needSpecial && !special) promises.push(getSpecialCharacters().then((d) => (special = d)));
		await Promise.all(promises);
		loading = false;
	}

	function getCharItems(m: QuizMode, selectedR: string[], selectedSp: string[]): QuizItem[] {
		const result: QuizItem[] = [];

		if (m === 'combined' && hiragana && katakana && special) {
			for (const chars of Object.values(hiragana.rows)) {
				for (const c of chars) result.push({ display: c.char, romaji: c.romaji });
			}
			for (const chars of Object.values(katakana.rows)) {
				for (const c of chars) result.push({ display: c.char, romaji: c.romaji });
			}
			for (const [, items] of Object.entries(special)) {
				for (const item of items) {
					result.push({ display: item.hiragana, romaji: item.romaji, example: item.example, exampleDisplay: item.exampleHira });
					result.push({ display: item.katakana, romaji: item.romaji, example: item.example, exampleDisplay: item.exampleKata });
				}
			}
			return result;
		}

		const data = m === 'hiragana' ? hiragana : katakana;
		if (data) {
			for (const r of selectedR) {
				const chars: CharacterItem[] = data.rows[r] || [];
				for (const c of chars) result.push({ display: c.char, romaji: c.romaji });
			}
		}

		if (special) {
			for (const sp of selectedSp) {
				const items: SpecialCharacterItem[] = special[sp] || [];
				for (const item of items) {
					if (m === 'katakana') {
						result.push({ display: item.katakana, romaji: item.romaji, example: item.example, exampleDisplay: item.exampleKata });
					} else {
						result.push({ display: item.hiragana, romaji: item.romaji, example: item.example, exampleDisplay: item.exampleHira });
					}
				}
			}
		}

		return result;
	}

	function buildRomajiPool(): string[] {
		const all: string[] = [];
		if (hiragana) {
			for (const chars of Object.values(hiragana.rows)) {
				for (const c of chars) all.push(c.romaji);
			}
		}
		if (special) {
			for (const [, specItems] of Object.entries(special)) {
				for (const item of specItems) all.push(item.romaji);
			}
		}
		return [...new Set(all)];
	}

	async function startQuiz() {
		await loadData();
		items = getCharItems(mode, rows, specials);
		allRomaji = buildRomajiPool();
		queue = shuffle(items);
		currentIndex = 0;
		wrongCounts = new Map();
		wrongItems = new Map();
		roundCorrect = 0;
		roundTotal = 0;
		quizDone = false;
		quizStarted = true;
	}

	function handleAnswer(isCorrect: boolean) {
		roundTotal++;
		if (isCorrect) roundCorrect++;

		if (!isCorrect) {
			const item = queue[currentIndex];
			const key = item.display;
			if (!wrongItems.has(key)) {
				wrongItems.set(key, { display: item.display, romaji: item.romaji });
			}
			const count = wrongCounts.get(key) || 0;
			if (count < 3) {
				wrongCounts.set(key, count + 1);
				const insertAt = Math.min(
					currentIndex + 2 + Math.floor(Math.random() * 3),
					queue.length
				);
				queue = [...queue.slice(0, insertAt), queue[currentIndex], ...queue.slice(insertAt)];
			}
		}

		if (currentIndex + 1 >= queue.length) {
			quizDone = true;
		} else {
			currentIndex++;
		}
	}

	let current = $derived(queue[currentIndex]);
	let options = $derived(current ? generateOptions(current.romaji, allRomaji) : []);
	let progress = $derived(queue.length > 0 ? Math.round((currentIndex / queue.length) * 100) : 0);
</script>

<div class="flex flex-col gap-5">
	<ModeSelector />

	{#if !quizStarted}
		<div class="flex flex-col gap-4">
			<div>
				<span class="dark:text-gray-300 mb-1 block text-sm font-medium text-gray-700">
					Timer: {timerDuration}s
				</span>
				<input
					type="range"
					min="1"
					max="20"
					step="1"
					bind:value={timerDuration}
					aria-label="Timer duration"
					class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600 dark:bg-gray-700"
				/>
				<div class="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
					<span>1s</span>
					<span>20s</span>
				</div>
			</div>
			<button
				onclick={() => startQuiz()}
				class="w-full rounded-lg bg-blue-600 px-8 py-4 text-xl font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
			>
				Start Quiz
			</button>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center py-12">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
			></div>
		</div>
	{:else if !quizDone && current}
		<div
			class="dark:bg-gray-700/50 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2"
		>
			<span class="dark:text-gray-300 text-sm text-gray-600">
				Progress: <span class="font-bold dark:text-white">{roundTotal}</span> / {queue.length} characters
			</span>
		</div>

		<div class="dark:bg-gray-700/30 rounded-lg bg-gray-100 p-1">
			<div
				class="h-1.5 rounded-lg bg-blue-500 transition-all duration-300"
				style="width: {progress}%"
			></div>
		</div>

		<QuizCard
			display={current.display}
			{options}
			correct={current.romaji}
			example={current.example}
			exampleDisplay={current.exampleDisplay}
			onAnswer={handleAnswer}
			large={specials.length === 0}
			{timerDuration}
		/>
	{:else if quizDone}
		<div class="flex flex-col items-center gap-4 py-8">
			<div class="text-5xl">{wrongItems.size === 0 ? '🎉' : '📝'}</div>
			<h3 class="dark:text-white text-xl font-bold text-gray-900">Quiz Complete!</h3>
			<p class="dark:text-gray-300 text-gray-600">
				{roundCorrect} / {roundTotal} correct
				{#if wrongItems.size > 0}
					<span class="text-red-500 dark:text-red-400">({wrongItems.size} wrong)</span>
				{/if}
			</p>

			{#if wrongItems.size > 0}
				<div class="w-full rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
					<p class="mb-2 text-sm font-medium text-red-700 dark:text-red-400">Needs practice:</p>
					<div class="flex flex-wrap gap-2">
						{#each [...wrongItems.values()] as item}
							<span class="rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm dark:bg-gray-700">
								<span class="font-bold dark:text-white">{item.display}</span>
								<span class="text-gray-500 dark:text-gray-400"> = {item.romaji}</span>
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<button
				onclick={() => startQuiz()}
				class="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
			>
				Try Again
			</button>
		</div>
	{/if}
</div>
