<script lang="ts">
	import type { TestAnalysis } from '$lib/types/medical';
	import StatusBadge from './StatusBadge.svelte';

	interface Props {
		label: string;
		history: TestAnalysis[];
		onClose: () => void;
	}

	const { label, history, onClose }: Props = $props();

	const sortedHistory = $derived([...history].sort((a, b) => 
		new Date(a.date).getTime() - new Date(b.date).getTime()
	));

	const newestFirst = $derived([...history].sort((a, b) => 
		new Date(b.date).getTime() - new Date(a.date).getTime()
	));

	const latest = $derived(newestFirst[0]);

	const values = $derived(sortedHistory.map(h => h.value));
	const dataMin = $derived(Math.min(...values));
	const dataMax = $derived(Math.max(...values));
    const refMin = $derived(latest.reference_min ?? dataMin);
    const refMax = $derived(latest.reference_max ?? dataMax);
    
    const minVal = $derived(Math.min(dataMin, refMin));
    const maxVal = $derived(Math.max(dataMax, refMax));
    
	const paddingFactor = 0.05; // Extremely tight to maximize chart area
	const range = $derived((maxVal - minVal) || 1);
	const yMin = $derived(minVal - range * paddingFactor);
	const yMax = $derived(maxVal + range * paddingFactor);
	const yRange = $derived(yMax - yMin);

	const width = 1000;
	const height = 400;
	const margin = { top: 20, right: 40, bottom: 30, left: 50 }; // Minimizing margins
	const chartWidth = width - margin.left - margin.right;
	const chartHeight = height - margin.top - margin.bottom;

	const points = $derived(sortedHistory.map((h, i) => {
		const x = margin.left + (i / (sortedHistory.length - 1 || 1)) * chartWidth;
		const y = margin.top + chartHeight - ((h.value - yMin) / yRange) * chartHeight;
		return { x, y, ...h };
	}));

	const pathData = $derived(points.reduce((acc, p, i) => 
		acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), ''
	));

    const areaData = $derived(points.length > 0 
        ? pathData + ` L ${points[points.length-1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`
        : ''
    );

	const refMinY = $derived(latest.reference_min !== null 
		? margin.top + chartHeight - ((latest.reference_min - yMin) / yRange) * chartHeight 
		: null
	);
	const refMaxY = $derived(latest.reference_max !== null 
		? margin.top + chartHeight - ((latest.reference_max - yMin) / yRange) * chartHeight 
		: null
	);

	function formatDate(dateStr: string, full = false) {
		return new Date(dateStr).toLocaleDateString('sv-SE', full ? {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		} : {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="detail-view">
	<header class="detail-header">
		<div class="header-left">
            <button class="back-btn" onclick={onClose} aria-label="Go back">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="title-group">
                <h2>{label}</h2>
                <span class="unit-tag">{latest.unit}</span>
            </div>
        </div>
		<div class="header-right">
			<StatusBadge status={latest.status} />
		</div>
	</header>

	<div class="detail-layout">
		<!-- Top Section: Optimized Chart -->
		<section class="chart-section">
			<div class="chart-card">
                <div class="chart-container">
					<svg viewBox="0 0 {width} {height}" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#10b981" stop-opacity="0.15" />
                                <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
                            </linearGradient>
                        </defs>

						<!-- Grid Lines (Y-axis) -->
                        {#each Array(5) as _, i}
                            {@const y = margin.top + (i * chartHeight) / 4}
                            {@const val = yMax - (i * yRange) / 4}
                            <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#1e293b" stroke-width="1" />
                            <text x={margin.left - 8} y={y} text-anchor="end" font-size="12" fill="#475569" alignment-baseline="middle">{val.toFixed(1)}</text>
                        {/each}

						<!-- Reference Range Band -->
						{#if refMinY !== null && refMaxY !== null}
							<rect 
								x={margin.left} 
								y={Math.min(refMinY, refMaxY)} 
								width={chartWidth} 
								height={Math.abs(refMaxY - refMinY)} 
								fill="rgba(16, 185, 129, 0.05)"
							/>
							<line 
								x1={margin.left} y1={refMinY} x2={width - margin.right} y2={refMinY} 
								stroke="#10b981" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.4"
							/>
							<line 
								x1={margin.left} y1={refMaxY} x2={width - margin.right} y2={refMaxY} 
								stroke="#10b981" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.4"
							/>
						{/if}

						<!-- Area & Path -->
                        <path d={areaData} fill="url(#areaGradient)" />
						<path d={pathData} fill="none" stroke="#10b981" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />

						<!-- Points -->
						{#each points as p}
							<g class="data-point">
								<circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#0f172a" stroke-width="2" />
                                <text x={p.x} y={p.y - 12} text-anchor="middle" font-size="12" font-weight="700" fill="#f8fafc">{p.value}</text>
							</g>
						{/each}

						<!-- X-axis Labels (Dates) -->
						{#each points as p, i}
							<text 
								x={p.x} 
								y={height - 5} 
								text-anchor="middle" 
								font-size="12" 
                                font-weight="600"
								fill="#64748b"
							>
								{formatDate(p.date)}
							</text>
						{/each}
					</svg>
				</div>
			</div>
		</section>

		<!-- Bottom Section: Balanced space for Summary & History -->
		<div class="bottom-section">
            <div class="info-grid">
                <!-- Summary Card -->
                <div class="summary-card">
                    <h3>Analysis</h3>
                    <div class="summary-stats">
                        <div class="stat">
                            <span class="label">Latest Result</span>
                            <span class="value">{latest.value} {latest.unit}</span>
                            <span class="sub">{formatDate(latest.date, true)}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Normal Range</span>
                            <span class="value">{latest.reference_min ?? 'N/A'} — {latest.reference_max ?? 'N/A'}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Status</span>
                            <span class="value status-{latest.status}">{latest.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <!-- Scrollable History -->
                <div class="history-card">
                    <div class="card-header">
                        <h3>Full History</h3>
                        <span class="count">{history.length} results</span>
                    </div>
                    <div class="history-list-container">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each newestFirst as h}
                                    <tr>
                                        <td>{formatDate(h.date, true)}</td>
                                        <td class="bold">{h.value} <small>{h.unit}</small></td>
                                        <td><StatusBadge status={h.status} size="sm" /></td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
		</div>
	</div>
</div>

<style>
	.detail-view {
		background-color: #0f172a;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.detail-header {
		padding: 0.5rem 0.75rem;
		background-color: #1e293b;
		border-bottom: 1px solid #334155;
		display: flex;
		justify-content: space-between;
		align-items: center;
        flex-shrink: 0;
	}

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #334155;
		border: 1px solid #475569;
		color: #e2e8f0;
		cursor: pointer;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		transition: all 150ms ease;
	}

	.title-group h2 {
		margin: 0;
		color: #f8fafc;
		font-size: 1rem;
		font-weight: 800;
	}

    .unit-tag {
        font-size: 0.7rem;
        color: #64748b;
        font-weight: 600;
    }

	.detail-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem;
		min-height: 0;
        overflow: hidden;
	}

	.chart-section {
		flex: 0.9; /* Reduced priority to ensure bottom cards fit */
		min-height: 0;
	}

    .chart-card {
        background-color: #111827;
        border: 1px solid #334155;
        border-radius: 0.5rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

	.chart-container {
		flex: 1;
		min-height: 0;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	.bottom-section {
		flex: 1.1; /* More space for the informational cards */
		min-height: 0;
	}

    .info-grid {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 0.5rem;
        height: 100%;
    }

    .summary-card, .history-card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 0.5rem;
        padding: 0.625rem;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .summary-card h3, .history-card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.7rem;
        font-weight: 800;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .summary-stats {
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
    }

    .stat .label {
        font-size: 0.55rem;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
    }

    .stat .value {
        font-size: 0.9375rem;
        font-weight: 800;
        color: #f8fafc;
    }

    .stat .sub {
        font-size: 0.6rem;
        color: #475569;
    }

    .status-normal { color: #10b981; }
    .status-high { color: #f59e0b; }
    .status-low { color: #dc2626; }

    .history-card .card-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 0.375rem;
    }

    .history-card .count {
        font-size: 0.6rem;
        color: #64748b;
        font-weight: 600;
    }

    .history-list-container {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        border: 1px solid #334155;
        border-radius: 0.375rem;
        background-color: #0f172a;
    }

    .history-list-container::-webkit-scrollbar { width: 4px; }
    .history-list-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

    .history-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.7rem;
    }

    .history-table th {
        text-align: left;
        padding: 0.375rem 0.625rem;
        background-color: #1e293b;
        color: #64748b;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 0.55rem;
        position: sticky;
        top: 0;
    }

    .history-table td {
        padding: 0.5rem 0.625rem;
        border-bottom: 1px solid #334155;
        color: #cbd5e1;
    }

    .bold { font-weight: 700; color: #f8fafc; }
    .history-table small { color: #64748b; font-size: 0.6rem; }

	@media (max-width: 1024px) {
		.info-grid { grid-template-columns: 1fr; }
        .summary-card { display: none; }
	}
</style>
