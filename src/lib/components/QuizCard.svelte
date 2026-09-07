<script lang="ts">
	type Props = {
		display: string;
		options: string[];
		correct: string;
		example?: string;
		exampleDisplay?: string;
		onAnswer: (correct: boolean) => void;
		large?: boolean;
	};

	let { display, options, correct, example, exampleDisplay, onAnswer, large = false }: Props = $props();

	let selected: string | null = $state(null);
	let showResult = $state(false);

	function pick(option: string) {
		if (showResult) return;
		selected = option;
		showResult = true;
		setTimeout(() => {
			onAnswer(option === correct);
			selected = null;
			showResult = false;
		}, 1200);
	}

	function optionClass(option: string): string {
		if (!showResult || selected === null) {
			return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600';
		}
		if (option === correct) {
			return 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400';
		}
		if (option === selected && option !== correct) {
			return 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400';
		}
		return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50';
	}
</script>

<div class="flex flex-col items-center gap-6">
	<div
		class="dark:bg-gray-700/50 flex min-h-[120px] w-full items-center justify-center rounded-2xl bg-gray-50 p-6"
	>
		<span class="dark:text-white text-center font-bold text-gray-900 {large ? 'text-7xl' : 'text-4xl'}">
			{display}
		</span>
	</div>

	{#if exampleDisplay}
		<p class="dark:text-gray-400 -mt-2 text-sm text-gray-500">
			Example: <span class="font-medium">{exampleDisplay}</span>
		</p>
	{/if}

	<div class="grid w-full grid-cols-2 gap-3">
		{#each options as option}
			<button
				onclick={() => pick(option)}
				disabled={showResult}
				class="rounded-xl border-2 px-4 py-3 text-center text-sm font-medium transition-all duration-200
					dark:text-white {optionClass(option)}
					{showResult ? 'cursor-default' : 'cursor-pointer active:scale-95'}"
			>
				{option}
			</button>
		{/each}
	</div>
</div>
