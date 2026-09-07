<script lang="ts">
	import './layout.css';
	import Navigation from '$lib/components/Navigation.svelte';
	import { darkMode } from '$lib/stores/quizStore';

	let { children } = $props();

	let isDark = $state(false);
	darkMode.subscribe((v) => (isDark = v));
</script>

<div class="{isDark ? 'dark' : ''} dark:bg-gray-900 min-h-screen bg-gray-50 transition-colors">
	<Navigation />
	{@render children()}
</div>
