<script lang="ts">
	import type { TestAnalysis } from '$lib/types/medical';
	import TestResultCard from '../ui/TestResultCard.svelte';

	interface Props {
		tests: TestAnalysis[];
	}

	const { tests }: Props = $props();

	// Group tests by label for better visualization
	const groupedTests = $derived.by(() => {
		const groups: Record<string, TestAnalysis[]> = {};

		for (const test of tests) {
			if (!groups[test.label]) {
				groups[test.label] = [];
			}
			groups[test.label].push(test);
		}

		// Sort each group by date (newest first)
		for (const label in groups) {
			groups[label].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			);
		}

		return Object.entries(groups).map(([label, testList]) => ({
			label,
			tests: testList
		}));
	});
</script>

<div class="test-history">
	<h2>Test Results</h2>

	{#if tests.length === 0}
		<div class="no-tests">
			<p>No test results available for this patient.</p>
		</div>
	{:else}
		<div class="test-groups">
			{#each groupedTests as group (group.label)}
				<div class="test-group">
					<h3>{group.label}</h3>
					<div class="tests-list">
						{#each group.tests as test (test.date)}
							<TestResultCard {test} />
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.test-history {
		width: 100%;
	}

	.test-history h2 {
		margin: 0 0 1.5rem 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #e2e8f0;
	}

	.no-tests {
		background-color: #1e293b;
		border: 1px solid #334155;
		border-radius: 0.75rem;
		padding: 2rem;
		text-align: center;
	}

	.no-tests p {
		margin: 0;
		color: #94a3b8;
	}

	.test-groups {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.test-group {
		border-bottom: 1px solid #334155;
		padding-bottom: 1.5rem;
	}

	.test-group:last-child {
		border-bottom: none;
	}

	.test-group h3 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #cbd5e1;
	}

	.tests-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
