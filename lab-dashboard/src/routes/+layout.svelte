<script lang="ts">
	import '$lib/styles/theme.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Lab Analysis Dashboard</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="app">
	{@render children()}
</div>

<style>
	:global(html, body) {
		height: 100%;
		margin: 0;
		padding: 0;
	}

	:global(:root) {
		--slate-900: #0f172a;
		--slate-800: #1e293b;
		--slate-700: #334155;
		--slate-600: #475569;
		--slate-400: #94a3b8;
		--slate-200: #e2e8f0;

		--status-normal: #10b981;
		--status-high: #f59e0b;
		--status-low: #dc2626;
		--status-unknown: #6b7280;

		--border-color: var(--slate-700);
		--text-primary: var(--slate-200);
		--text-secondary: var(--slate-400);
		--bg-primary: var(--slate-900);
		--bg-secondary: var(--slate-800);
	}

	.app {
		height: 100%;
		display: flex;
		background-color: #0f172a;
		color: #e2e8f0;
	}
</style>

