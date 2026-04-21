<script lang="ts">
	import type { TestAnalysis } from '$lib/types/medical';
	import TestResultCard from '../ui/TestResultCard.svelte';

	interface Props {
		tests: TestAnalysis[];
		onSelectTest?: (label: string) => void;
	}

	const { tests, onSelectTest }: Props = $props();

	// Group tests by label to pass history to cards
	const groupedTests = $derived.by(() => {
		const groups: Record<string, TestAnalysis[]> = {};

		for (const test of tests) {
			if (!groups[test.label]) {
				groups[test.label] = [];
			}
			groups[test.label].push(test);
		}

		// Sort each group by date (newest first)
		return Object.entries(groups).map(([label, testList]) => ({
			label,
			history: testList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		}));
	});
</script>

<div class="test-history">
	{#if tests.length === 0}
		<div class="no-tests">
			<p>No test results available for this patient.</p>
		</div>
	{:else}
		<div class="tests-grid">
			{#each groupedTests as group (group.label)}
				<TestResultCard 
					label={group.label} 
					history={group.history} 
					onclick={() => onSelectTest?.(group.label)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.test-history {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.no-tests {
		background-color: #1e293b;
		border: 1px solid #334155;
		border-radius: 0.75rem;
		padding: 2rem;
		text-align: center;
	}

	.tests-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
		align-content: start;
	}

	@media (max-width: 640px) {
		.tests-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
