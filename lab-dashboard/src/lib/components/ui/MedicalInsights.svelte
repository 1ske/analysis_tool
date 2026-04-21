<script lang="ts">
	import { streamMedicalInsights, constructInsightPrompt } from '$lib/services/ollamaService';
	import type { TestAnalysis, Patient } from '$lib/types/medical';

	interface Props {
		patient: Patient;
		latestTests: TestAnalysis[];
	}

	const { patient, latestTests }: Props = $props();

	let streamingText = $state('');
	let isAnalyzing = $state(false);
	let error = $state<string | null>(null);

	async function runAnalysis(signal: AbortSignal) {
		isAnalyzing = true;
		streamingText = '';
		error = null;

		try {
			const prompt = constructInsightPrompt(patient, latestTests);
			const stream = streamMedicalInsights(prompt, signal);

			for await (const chunk of stream) {
				// Stop if this specific analysis run was aborted
				if (signal.aborted) return;
				streamingText += chunk;
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') return;
			// If we were aborted during the fetch or stream, don't show error
			if (signal.aborted) return;
			
			error = err instanceof Error ? err.message : 'Ett fel uppstod vid analysen';
		} finally {
			// Only update status if this was the latest active analysis
			if (!signal.aborted) {
				isAnalyzing = false;
			}
		}
	}

    // Automatically trigger analysis when patient or tests change
    $effect(() => {
        if (patient.id && latestTests.length > 0) {
            const controller = new AbortController();
            runAnalysis(controller.signal);
            
            // Cleanup: This runs when dependencies change or component is destroyed
            return () => {
                controller.abort();
            };
        }
    });
</script>

<div class="medical-insights">
	<div class="insights-header">
		<div class="title">
			<div class="ai-pulse" class:active={isAnalyzing}></div>
			<h3>AI Analys</h3>
		</div>
		<div class="status-tag" class:active={isAnalyzing}>
			{isAnalyzing ? 'Analyserar...' : 'Klar'}
		</div>
	</div>

	<div class="insights-content" class:empty={!streamingText && !isAnalyzing}>
		{#if isAnalyzing && !streamingText}
			<div class="thinking">
				<div class="dot-flashing"></div>
			</div>
		{/if}

		{#if streamingText}
			<div class="text-output">
				{streamingText}
			</div>
		{/if}

		{#if error}
			<div class="error-msg">{error}</div>
		{/if}
	</div>
</div>

<style>
	.medical-insights {
		background-color: #1e293b;
		border: 1px solid #334155;
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		height: 100%;
        min-height: 140px;
	}

	.insights-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(51, 65, 85, 0.5);
	}

	.title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

    .ai-pulse {
        width: 8px;
        height: 8px;
        background-color: #64748b;
        border-radius: 50%;
        transition: background-color 300ms ease;
    }

    .ai-pulse.active {
        background-color: #10b981;
        box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
        animation: pulse-green 2s infinite;
    }

    @keyframes pulse-green {
        0% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.7); }
        70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0); }
    }

	.title h3 {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 800;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-tag {
		font-size: 0.65rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		padding: 2px 6px;
		background-color: rgba(51, 65, 85, 0.3);
		border-radius: 4px;
	}

	.status-tag.active {
		color: #10b981;
		background-color: rgba(16, 185, 129, 0.1);
	}

	.insights-content {
		flex: 1;
		font-size: 0.8125rem;
		line-height: 1.6;
		color: #cbd5e1;
		overflow-y: auto;
		position: relative;
        padding-right: 0.25rem;
	}

	.insights-content.empty {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.text-output {
		white-space: pre-wrap;
	}

	.error-msg {
		color: #ef4444;
		font-size: 0.75rem;
		font-weight: 600;
	}

	/* Dot flashing animation */
	.dot-flashing {
		position: relative;
		width: 6px;
		height: 6px;
		border-radius: 3px;
		background-color: #10b981;
		animation: dot-flashing 1s infinite linear alternate;
		animation-delay: 0.5s;
	}
	.dot-flashing::before, .dot-flashing::after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 0;
	}
	.dot-flashing::before {
		left: -10px;
		width: 6px;
		height: 6px;
		border-radius: 3px;
		background-color: #10b981;
		animation: dot-flashing 1s infinite linear alternate;
		animation-delay: 0s;
	}
	.dot-flashing::after {
		left: 10px;
		width: 6px;
		height: 6px;
		border-radius: 3px;
		background-color: #10b981;
		animation: dot-flashing 1s infinite linear alternate;
		animation-delay: 1s;
	}

	@keyframes dot-flashing {
		0% { background-color: #10b981; }
		50%, 100% { background-color: rgba(16, 185, 129, 0.2); }
	}

	.insights-content::-webkit-scrollbar {
		width: 4px;
	}
	.insights-content::-webkit-scrollbar-thumb {
		background: #334155;
		border-radius: 4px;
	}
</style>
