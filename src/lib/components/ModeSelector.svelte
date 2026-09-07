<script lang="ts">
	import { quizMode, selectedRows, selectedSpecials } from '$lib/stores/quizStore';
	import type { QuizMode } from '$lib/stores/quizStore';
	import { ROW_LABELS, SPECIAL_LABELS } from '$lib/utils/dataLoader';

	let mode: QuizMode = $state('hiragana');
	let rows: string[] = $state(['a']);
	let specials: string[] = $state([]);
	let open = $state(false);
	let dropdownEl: HTMLDivElement | undefined = $state();

	quizMode.subscribe((v) => (mode = v));
	selectedRows.subscribe((v) => (rows = v));
	selectedSpecials.subscribe((v) => (specials = v));

	function onModeChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value as QuizMode;
		quizMode.set(val);
		selectedRows.set(['a']);
		selectedSpecials.set([]);
	}

	function toggleRow(key: string) {
		const current = [...rows];
		const idx = current.indexOf(key);
		if (idx >= 0) {
			if (current.length + specials.length > 1) {
				current.splice(idx, 1);
				selectedRows.set(current);
			}
		} else {
			selectedRows.set([...current, key]);
		}
	}

	function toggleSpecial(key: string) {
		const current = [...specials];
		const idx = current.indexOf(key);
		if (idx >= 0) {
			if (current.length + rows.length > 1) {
				current.splice(idx, 1);
				selectedSpecials.set(current);
			}
		} else {
			selectedSpecials.set([...current, key]);
		}
	}

	function selectAllRows() {
		selectedRows.set(Object.keys(ROW_LABELS));
	}

	function selectAllSpecials() {
		selectedSpecials.set(Object.keys(SPECIAL_LABELS));
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

	let selectionCount = $derived(rows.length + specials.length);

	let summaryText = $derived.by(() => {
		const parts: string[] = [];
		for (const r of rows) {
			const label = ROW_LABELS[r];
			if (label) parts.push(label.split(' ')[0]);
		}
		for (const s of specials) {
			const label = SPECIAL_LABELS[s];
			if (label) parts.push(label.split(' ')[0]);
		}
		if (parts.length <= 3) return parts.join(', ');
		return `${parts.slice(0, 2).join(', ')} +${parts.length - 2} more`;
	});
</script>

<div class="flex flex-wrap gap-3">
	<div class="min-w-[140px] flex-1">
		<label for="mode-select" class="dark:text-gray-300 mb-1 block text-sm font-medium text-gray-700"
			>Mode</label
		>
		<select
			id="mode-select"
			value={mode}
			onchange={onModeChange}
			class="dark:border-gray-600 dark:bg-gray-700 dark:text-white w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		>
			<option value="hiragana">Hiragana</option>
			<option value="katakana">Katakana</option>
			<option value="combined">Combined</option>
		</select>
	</div>

	{#if mode !== 'combined'}
		<div class="relative min-w-[200px] flex-1" bind:this={dropdownEl}>
			<span class="dark:text-gray-300 mb-1 block text-sm font-medium text-gray-700"
				>Characters</span
			>
			<button
				type="button"
				aria-haspopup="listbox"
				aria-expanded={open}
				onclick={() => (open = !open)}
				class="dark:border-gray-600 dark:bg-gray-700 dark:text-white flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			>
				<span class="truncate">{summaryText}</span>
				<svg
					class="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform {open
						? 'rotate-180'
						: ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{#if open}
				<div
					class="dark:border-gray-600 dark:bg-gray-800 absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
				>
					<div class="flex items-center justify-between border-b border-gray-100 px-3 py-1.5 dark:border-gray-700">
						<span class="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">Basic Rows</span>
						<button
							onclick={selectAllRows}
							class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>Select all</button>
					</div>
					{#each Object.entries(ROW_LABELS) as [key, label]}
						<button
							type="button"
							onclick={() => toggleRow(key)}
							class="dark:hover:bg-gray-700 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
						>
							<span
								class="flex h-4 w-4 shrink-0 items-center justify-center rounded border
									{rows.includes(key)
									? 'border-blue-500 bg-blue-500 text-white'
									: 'border-gray-300 dark:border-gray-600'}"
							>
								{#if rows.includes(key)}
									<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</span>
							<span class="dark:text-gray-200 text-gray-700">{label}</span>
						</button>
					{/each}

					<div class="flex items-center justify-between border-y border-gray-100 px-3 py-1.5 dark:border-gray-700">
						<span class="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">Special</span>
						<button
							onclick={selectAllSpecials}
							class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>Select all</button>
					</div>
					{#each Object.entries(SPECIAL_LABELS) as [key, label]}
						<button
							type="button"
							onclick={() => toggleSpecial(key)}
							class="dark:hover:bg-gray-700 flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
						>
							<span
								class="flex h-4 w-4 shrink-0 items-center justify-center rounded border
									{specials.includes(key)
									? 'border-purple-500 bg-purple-500 text-white'
									: 'border-gray-300 dark:border-gray-600'}"
							>
								{#if specials.includes(key)}
									<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</span>
							<span class="dark:text-gray-200 text-gray-700">{label}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
