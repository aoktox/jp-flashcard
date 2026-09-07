<script lang="ts">
	import { activeTab, darkMode } from '$lib/stores/quizStore';
	import type { ActiveTab } from '$lib/stores/quizStore';

	function setTab(tab: ActiveTab) {
		activeTab.set(tab);
	}

	function toggleDark() {
		darkMode.update((v) => !v);
	}

	let currentTab: ActiveTab = $state('character');
	let isDark = $state(false);

	activeTab.subscribe((v) => (currentTab = v));
	darkMode.subscribe((v) => (isDark = v));
</script>

<nav class="dark:bg-gray-800 dark:border-gray-700 border-b border-gray-200 bg-white">
	<div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
		<h1 class="dark:text-white text-lg font-bold text-gray-900">
			<span class="text-xl">🇯🇵</span> JP Flashcard
		</h1>
		<div class="flex items-center gap-2">
			<div class="dark:bg-gray-700 flex rounded-lg bg-gray-100 p-1">
				<button
					onclick={() => setTab('character')}
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {currentTab ===
					'character'
						? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}"
				>
					Characters
				</button>
				<button
					onclick={() => setTab('vocabulary')}
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {currentTab ===
					'vocabulary'
						? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
						: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}"
				>
					Vocabulary
				</button>
			</div>
			<button
				onclick={toggleDark}
				class="dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200"
				aria-label="Toggle dark mode"
			>
				{#if isDark}
					<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
							clip-rule="evenodd"
						/>
					</svg>
				{:else}
					<svg
						class="dark:text-gray-300 h-5 w-5 text-gray-600"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
					</svg>
				{/if}
			</button>
		</div>
	</div>
</nav>
