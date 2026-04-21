<script lang="ts">
	import type { TestStatus } from '$lib/types/medical';

	interface Props {
		status: TestStatus;
	}

	const { status }: Props = $props();

	const statusText = {
		normal: 'Normal',
		high: 'High',
		low: 'Low',
		unknown: 'Unknown'
	};
</script>

<span class="status-badge status-{status}">
	{statusText[status]}
</span>

<style>
	.status-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.status-normal {
		background-color: rgba(16, 185, 129, 0.1);
		color: #10b981;
		border: 1px solid rgba(16, 185, 129, 0.3);
	}

	.status-high {
		background-color: rgba(245, 158, 11, 0.1);
		color: #f59e0b;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.status-low {
		background-color: rgba(220, 38, 38, 0.1);
		color: #dc2626;
		border: 1px solid rgba(220, 38, 38, 0.3);
	}

	.status-unknown {
		background-color: rgba(107, 114, 128, 0.1);
		color: #6b7280;
		border: 1px solid rgba(107, 114, 128, 0.3);
	}
</style>
