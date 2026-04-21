<script lang="ts">
	import type { TestAnalysis } from '$lib/types/medical';

	interface Props {
		history: TestAnalysis[];
		color?: string;
	}

	const { history, color = '#10b981' }: Props = $props();

	// Sort history by date (oldest to newest for plotting)
	const sortedData = $derived([...history].sort((a, b) => 
		new Date(a.date).getTime() - new Date(b.date).getTime()
	));

	const values = $derived(sortedData.map(d => d.value));
	const minVal = $derived(Math.min(...values));
	const maxVal = $derived(Math.max(...values));
	const range = $derived(maxVal - minVal || 1);

	// SVG Dimensions
	const width = 200;
	const height = 40;
	const padding = 5;

	const points = $derived(sortedData.map((d, i) => {
		const x = padding + (i / (sortedData.length - 1 || 1)) * (width - 2 * padding);
		const y = height - padding - ((d.value - minVal) / range) * (height - 2 * padding);
		return { x, y, value: d.value, date: d.date };
	}));

	const pathData = $derived(points.reduce((acc, p, i) => 
		acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ''
	));
</script>

<div class="trend-chart">
	<svg {width} {height} viewBox="0 0 {width} {height}" preserveAspectRatio="none">
		<!-- Sparkline Path -->
		<path
			d={pathData}
			fill="none"
			stroke={color}
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		
		<!-- Dots for data points -->
		{#each points as p}
			<circle
				cx={p.x}
				cy={p.y}
				r="3"
				fill={color}
				stroke="#1e293b"
				stroke-width="1.5"
			/>
		{/each}
	</svg>
</div>

<style>
	.trend-chart {
		width: 100%;
		height: 40px;
		display: flex;
		align-items: center;
		overflow: visible;
	}

	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	path {
		transition: d 300ms ease-in-out;
	}
</style>
