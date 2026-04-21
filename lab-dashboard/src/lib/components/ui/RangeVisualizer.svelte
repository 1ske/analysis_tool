<script lang="ts">
	interface Props {
		value: number;
		min: number | null;
		max: number | null;
		status: 'normal' | 'high' | 'low' | 'unknown';
	}

	const { value, min, max, status }: Props = $props();

	// Calculate position percentage (0-100)
	const percentage = $derived.by(() => {
		if (min === null || max === null || min === max) return 50;
		const p = ((value - min) / (max - min)) * 100;
		return Math.max(0, Math.min(100, p));
	});

	// Determine if value is outside the 0-100 range for visualization
	const isUnder = $derived(min !== null && value < min);
	const isOver = $derived(max !== null && value > max);
</script>

<div class="range-visualizer">
	<div class="range-track">
		<!-- Markers for min/max -->
		{#if min !== null && max !== null}
			<div class="range-valid"></div>
			<div class="marker marker-min" style="left: 0%">
				<span class="marker-label">{min}</span>
			</div>
			<div class="marker marker-max" style="left: 100%">
				<span class="marker-label">{max}</span>
			</div>
		{/if}

		<!-- Value indicator -->
		<div
			class="value-indicator status-{status}"
			style="left: {percentage}%"
			class:under={isUnder}
			class:over={isOver}
		>
			<div class="indicator-dot"></div>
		</div>
	</div>
</div>

<style>
	.range-visualizer {
		padding: 1.125rem 0.25rem 0.25rem 0.25rem;
		width: 100%;
	}

	.range-track {
		position: relative;
		height: 4px;
		background-color: #334155;
		border-radius: 2px;
	}

	.range-valid {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(16, 185, 129, 0.1);
		border-radius: 2px;
	}

	.marker {
		position: absolute;
		top: -3px;
		width: 1px;
		height: 10px;
		background-color: #475569;
	}

	.marker-label {
		position: absolute;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.6rem;
		font-weight: 700;
		color: #64748b;
		white-space: nowrap;
	}

	.value-indicator {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 10;
		transition: left 500ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.indicator-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: #1e293b;
		border: 2px solid currentColor;
		box-shadow: 0 0 4px rgba(0,0,0,0.5);
	}

	.status-normal { color: #10b981; }
	.status-high { color: #f59e0b; }
	.status-low { color: #dc2626; }
	.status-unknown { color: #6b7280; }

	.value-indicator:not(.status-normal):not(.status-unknown) .indicator-dot {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% { box-shadow: 0 0 0 0px currentColor; }
		70% { box-shadow: 0 0 0 4px rgba(0, 0, 0, 0); }
		100% { box-shadow: 0 0 0 0px rgba(0, 0, 0, 0); }
	}
</style>
