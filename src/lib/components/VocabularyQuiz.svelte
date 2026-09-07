<script lang="ts">
	import { getVocabulary, JLPT_LEVELS, type VocabData, type JlptLevel } from '$lib/utils/dataLoader';
	import { selectedLevels } from '$lib/stores/quizStore';
	import { shuffle, generateOptions } from '$lib/utils/quizLogic';

	let levels: JlptLevel[] = $state(['N5']);
	selectedLevels.subscribe((v) => (levels = v));

	let open = $state(false);
	let dropdownEl: HTMLDivElement | undefined = $state();

	function toggleLevel(lvl: JlptLevel) {
		const current = [...levels];
		const idx = current.indexOf(lvl);
		if (idx >= 0) {
			if (current.length > 1) {
				current.splice(idx, 1);
				selectedLevels.set(current);
			}
		} else {
			selectedLevels.set([...current, lvl]);
		}
	}

	function selectAll() {
		selectedLevels.set([...JLPT_LEVELS]);
	}

	function handleClickOutside(e: MouseEvent) {
		if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true);
			return () => document.removeEventListener('click', handleClickOutside, true);
		}
	});

	let summaryText = $derived.by(() => {
		const sorted = [...levels].sort((a, b) => JLPT_LEVELS.indexOf(a) - JLPT_LEVELS.indexOf(b));
		if (sorted.length <= 3) return sorted.join(', ');
		return `${sorted.slice(0, 2).join(', ')} +${sorted.length - 2} more`;
	});

	let vocab: VocabData | null = $state(null);
	let loading = $state(true);

	type VocabQuestion = {
		display: string;
		subtitle: string;
		correct: string;
		example: string;
		exampleRomaji: string;
		exampleMeaning: string;
		hiragana: string;
	};

	type WrongItem = { display: string; hiragana: string; meaning: string };

	let questions: VocabQuestion[] = $state([]);
	let currentIndex = $state(0);
	let quizDone = $state(false);
	let showDetail = $state(false);
	let allMeanings: string[] = $state([]);
	let selected: string | null = $state(null);
	let wrongItems: Map<string, WrongItem> = $state(new Map());
	let roundCorrect = $state(0);
	let roundTotal = $state(0);
	let quizStarted = $state(false);

	async function startQuiz() {
		loading = true;
		const datasets = await Promise.all(levels.map((lvl) => getVocabulary(lvl)));
		const allWords = datasets.flatMap((d) => d.words);
		vocab = { words: allWords };
		const words = shuffle(allWords);
		questions = words.map((w) => ({
			display: w.kanji,
			subtitle: w.meaning,
			correct: w.meaning,
			example: w.example,
			exampleRomaji: w.exampleRomaji,
			exampleMeaning: w.exampleMeaning,
			hiragana: w.hiragana
		}));
		allMeanings = [...new Set(allWords.map((w) => w.meaning))];
		currentIndex = 0;
		quizDone = false;
		showDetail = false;
		selected = null;
		wrongItems = new Map();
		roundCorrect = 0;
		roundTotal = 0;
		loading = false;
		quizStarted = true;
	}

	let lastCorrect = $state(false);

	function handleAnswer(option: string) {
		if (showDetail) return;
		selected = option;
		const isCorrect = option === current.correct;
		lastCorrect = isCorrect;
		roundTotal++;
		if (isCorrect) roundCorrect++;

		if (!isCorrect) {
			const item = current;
			if (!wrongItems.has(item.display)) {
				wrongItems.set(item.display, {
					display: item.display,
					hiragana: item.hiragana,
					meaning: item.correct
				});
			}
			const insertAt = Math.min(
				currentIndex + 2 + Math.floor(Math.random() * 3),
				questions.length
			);
			questions = [
				...questions.slice(0, insertAt),
				questions[currentIndex],
				...questions.slice(insertAt)
			];
		}

		showDetail = true;

		if (!isCorrect) {
			setTimeout(() => advance(), 1200);
		}
	}

	function advance() {
		showDetail = false;
		selected = null;
		lastCorrect = false;
		if (currentIndex + 1 >= questions.length) {
			quizDone = true;
		} else {
			currentIndex++;
		}
	}

	let current = $derived(questions[currentIndex]);
	let options = $derived(current ? generateOptions(current.correct, allMeanings) : []);
	let progress = $derived(
		questions.length > 0 ? Math.round((currentIndex / questions.length) * 100) : 0
	);

	function optionClass(option: string): string {
		if (!showDetail || selected === null) {
			return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-gray-600';
		}
		if (option === current.correct) {
			return 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400';
		}
		if (option === selected && option !== current.correct) {
			return 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
		}
		return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50';
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex items-end gap-3">
		<div class="relative min-w-[160px] flex-1" bind:this={dropdownEl}>
			<span class="dark:text-gray-300 mb-1 block text-sm font-medium text-gray-700">JLPT Level</span>
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={open}
				onclick={() => (open = !open)}
				class="dark:border-gray-600 dark:bg-gray-700 dark:text-white flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
			>
				<span class="truncate">{summaryText}</span>
				<svg
					class="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform {open ? 'rotate-180' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{#if open}
				<div class="dark:border-gray-600 dark:bg-gray-800 absolute z-10 mt-1 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
					<div class="flex items-center justify-between border-b border-gray-100 px-3 py-1.5 dark:border-gray-700">
						<span class="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">Levels</span>
						<button
							onclick={selectAll}
							class="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
						>Select all</button>
					</div>
					{#each JLPT_LEVELS as lvl}
						<button
							type="button"
							onclick={() => toggleLevel(lvl)}
							class="dark:hover:bg-gray-700 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
						>
							<span
								class="flex h-4 w-4 shrink-0 items-center justify-center rounded border
									{levels.includes(lvl)
									? 'border-purple-500 bg-purple-500 text-white'
									: 'border-gray-300 dark:border-gray-600'}"
							>
								{#if levels.includes(lvl)}
									<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</span>
							<span class="dark:text-gray-200 text-gray-700">{lvl}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	{#if !quizStarted}
		<div class="flex flex-col items-center gap-4 py-8">
			<p class="dark:text-gray-400 text-gray-500">Select JLPT levels, then start the quiz.</p>
			<button
				onclick={() => startQuiz()}
				class="rounded-lg bg-purple-600 px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-purple-700"
			>
				Start Quiz
			</button>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center py-12">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"
			></div>
		</div>
	{:else if !quizDone && current}
		<div
			class="dark:bg-gray-700/50 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2"
		>
			<span class="dark:text-gray-300 text-sm text-gray-600">
				Progress: <span class="font-bold dark:text-white">{roundTotal}</span> / {questions.length} words
			</span>
		</div>

		<div class="dark:bg-gray-700/30 rounded-lg bg-gray-100 p-1">
			<div
				class="h-1.5 rounded-lg bg-purple-500 transition-all duration-300"
				style="width: {progress}%"
			></div>
		</div>

		<div class="flex flex-col items-center gap-6">
			<div
				class="dark:bg-gray-700/50 flex min-h-[120px] w-full flex-col items-center justify-center rounded-2xl bg-gray-50 p-6"
			>
				<span class="dark:text-white text-5xl font-bold text-gray-900">{current.display}</span>
				<span class="dark:text-gray-400 mt-2 text-sm text-gray-500">{current.hiragana}</span>
			</div>

			<div class="grid w-full grid-cols-2 gap-3">
				{#each options as option}
					<button
						onclick={() => handleAnswer(option)}
						disabled={showDetail}
						class="rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all duration-200
							dark:text-white {optionClass(option)}
							{showDetail ? 'cursor-default' : 'cursor-pointer active:scale-95'}"
					>
						{option}
					</button>
				{/each}
			</div>

			{#if showDetail && lastCorrect}
				<div class="dark:border-gray-700 dark:bg-gray-800 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
					<p class="mb-1 text-xs font-medium text-green-600 dark:text-green-400">Example</p>
					<p class="dark:text-white text-gray-900">{current.example}</p>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{current.exampleRomaji}</p>
					<p class="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">{current.exampleMeaning}</p>
					<button
						onclick={advance}
						class="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
					>
						Next
					</button>
				</div>
			{/if}
		</div>
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
								<span class="text-gray-400 dark:text-gray-500">({item.hiragana})</span>
								<span class="text-gray-500 dark:text-gray-400"> = {item.meaning}</span>
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<button
				onclick={() => startQuiz()}
				class="rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-purple-700"
			>
				Try Again
			</button>
		</div>
	{/if}
</div>
