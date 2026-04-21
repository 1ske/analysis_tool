<script lang="ts">
	import type { TestAnalysis } from '$lib/types/medical';
	import StatusBadge from './StatusBadge.svelte';
	import RangeVisualizer from './RangeVisualizer.svelte';

	interface Props {
		test: TestAnalysis;
	}

	const { test }: Props = $props();

	const testDate = $derived(new Date(test.date));
	const dateString = $derived(
		testDate.toLocaleDateString('sv-SE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		})
	);
</script>

<div class="test-card">
	<div class="card-header">
		<div class="header-left">
			<h3>{test.label}</h3>
			<span class="date">{dateString}</span>
		</div>
		<StatusBadge status={test.status} />
	</div>

	<div class="card-body">
		<div class="main-info">
			<div class="value-section">
				<span class="label">Result</span>
				<span class="value">{test.value} <span class="unit">{test.unit}</span></span>
			</div>

			{#if test.status !== 'unknown'}
				<div class="reference-section">
					<span class="label">Reference Range</span>
					<span class="reference">
						{test.reference_min} - {test.reference_max} {test.unit}
					</span>
				</div>
			{/if}

			{#if test.raw_age_range}
				<div class="age-section">
					<span class="label">Age Group</span>
					<span class="age-range">{test.raw_age_range}</span>
				</div>
			{/if}
		</div>

		<div class="visualizer-container">
			<RangeVisualizer
				value={test.value}
				min={test.reference_min}
				max={test.reference_max}
				status={test.status}
			/>
		</div>
	</div>
</div>

<style>
	.test-card {
		background-color: #1e293b;
		border: 1px solid #334155;
		border-radius: 0.75rem;
		padding: 1.25rem;
		margin-bottom: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: all 250ms ease-in-out;
	}

	.test-card:hover {
		border-color: #475569;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.card-header h3 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 700;
		color: #f1f5f9;
	}

	.date {
		font-size: 0.75rem;
		color: #94a3b8;
		font-weight: 500;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.main-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1.5rem;
	}

	.value-section,
	.reference-section,
	.age-section {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.label {
		font-size: 0.7rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #f1f5f9;
	}

	.unit {
		font-size: 0.875rem;
		color: #94a3b8;
		font-weight: 500;
	}

	.reference,
	.age-range {
		font-size: 0.9rem;
		font-weight: 600;
		color: #cbd5e1;
	}

	.visualizer-container {
		width: 100%;
		padding-top: 0.5rem;
		border-top: 1px solid #334155;
	}

	@media (max-width: 640px) {
		.main-info {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
