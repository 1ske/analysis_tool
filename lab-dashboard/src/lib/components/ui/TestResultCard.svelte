<script lang="ts">
	import type { TestAnalysis } from '$lib/types/medical';
	import StatusBadge from './StatusBadge.svelte';
	import RangeVisualizer from './RangeVisualizer.svelte';
	import TrendChart from './TrendChart.svelte';

	interface Props {
		label: string;
		history: TestAnalysis[];
		onclick?: () => void;
	}

	const { label, history, onclick }: Props = $props();

	// Latest test is the first one (sorted by date descending in service)
	const latest = $derived(history[0]);
	
	const testDate = $derived(new Date(latest.date));
	const dateString = $derived(
		testDate.toLocaleDateString('sv-SE', {
			month: 'short',
			day: '2-digit'
		})
	);

	// Map status to color for trend chart
	const statusColors = {
		normal: '#10b981',
		high: '#f59e0b',
		low: '#dc2626',
		unknown: '#6b7280'
	};
</script>

<div 
	class="test-card" 
	role="button" 
	tabindex="0" 
	onclick={() => onclick?.()} 
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
>
	<div class="card-header">
		<div class="header-left">
			<h3>{label}</h3>
			<span class="date">Latest: {dateString}</span>
		</div>
		<StatusBadge status={latest.status} />
	</div>

	<div class="card-body">
		<div class="result-row">
			<div class="value-display">
				<span class="value">{latest.value}</span>
				<span class="unit">{latest.unit}</span>
			</div>
			
			<div class="trend-container">
				<TrendChart {history} color={statusColors[latest.status]} />
			</div>
		</div>

		<div class="visualizer-container">
			<RangeVisualizer
				value={latest.value}
				min={latest.reference_min}
				max={latest.reference_max}
				status={latest.status}
			/>
		</div>

		{#if latest.reference_min !== null}
			<div class="ref-range-text">
				Ref: {latest.reference_min} - {latest.reference_max} {latest.unit}
			</div>
		{/if}
	</div>
</div>

<style>
	.test-card {
		background-color: #1e293b;
		border: 1px solid #334155;
		border-radius: 0.5rem;
		padding: 0.875rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: all 200ms ease-in-out;
		height: 100%;
	}

	.test-card:hover {
		border-color: #475569;
		background-color: #243147;
		transform: translateY(-1px);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.header-left {
		display: flex;
		flex-direction: column;
	}

	.card-header h3 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 700;
		color: #f1f5f9;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 140px;
	}

	.date {
		font-size: 0.65rem;
		color: #94a3b8;
		font-weight: 600;
		text-transform: uppercase;
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.result-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.value-display {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
	}

	.value {
		font-size: 1.5rem;
		font-weight: 800;
		color: #f8fafc;
	}

	.unit {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 600;
	}

	.trend-container {
		flex: 1;
		height: 32px;
		max-width: 80px;
	}

	.visualizer-container {
		margin: 0.25rem 0;
	}

	.ref-range-text {
		font-size: 0.65rem;
		color: #94a3b8;
		font-weight: 600;
		text-align: center;
		background-color: rgba(15, 23, 42, 0.3);
		padding: 2px 4px;
		border-radius: 4px;
	}
</style>
