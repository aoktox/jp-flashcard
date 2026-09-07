<script lang="ts">
	import { activeTab } from '$lib/stores/quizStore';
	import type { ActiveTab } from '$lib/stores/quizStore';
	import CharacterQuiz from '$lib/components/CharacterQuiz.svelte';
	import VocabularyQuiz from '$lib/components/VocabularyQuiz.svelte';

	let tab: ActiveTab = $state('character');
	activeTab.subscribe((v) => (tab = v));
</script>

<svelte:head>
	<title>JP Flashcard - Learn Japanese</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-6">
	{#if tab === 'character'}
		<CharacterQuiz />
	{:else}
		<VocabularyQuiz />
	{/if}
</main>
