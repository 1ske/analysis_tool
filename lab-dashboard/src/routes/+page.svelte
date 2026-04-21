<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import PatientHeader from '$lib/components/ui/PatientHeader.svelte';
	import TestHistory from '$lib/components/sections/TestHistory.svelte';
	import MedicalInsights from '$lib/components/ui/MedicalInsights.svelte';
	import TestDetailView from '$lib/components/ui/TestDetailView.svelte';
	import { loadReferenceData, loadPatientData } from '$lib/services/dataLoader';
	import { analyzePatient } from '$lib/services/analysisService';
	import type { ReferenceData, PatientData } from '$lib/types/medical';

	// State
	let selectedPatientId = $state<string | null>(null);
	let selectedTestLabel = $state<string | null>(null);
	let sidebarOpen = $state(false);
	let referenceData = $state<ReferenceData | null>(null);
	let patientData = $state<PatientData | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Load data on mount
	$effect(async () => {
		try {
			referenceData = await loadReferenceData();
			patientData = await loadPatientData();
			// Select first patient by default
			if (patientData?.patients.length > 0) {
				selectedPatientId = patientData.patients[0].id;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	});

	// Derived state
	const selectedPatient = $derived(
		patientData?.patients.find((p) => p.id === selectedPatientId)
	);

	const analyzedTests = $derived.by(() => {
		if (!selectedPatient || !referenceData) return [];
		return analyzePatient(referenceData, selectedPatient);
	});

    // Get only the most recent test of each type for AI context
    const latestTestsOnly = $derived.by(() => {
        const unique = new Map();
        [...analyzedTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach(t => {
                if (!unique.has(t.label)) unique.set(t.label, t);
            });
        return Array.from(unique.values());
    });

	function handleSelectPatient(patientId: string) {
		selectedPatientId = patientId;
		selectedTestLabel = null; // Reset selection when patient changes
	}

	function handleSelectTest(label: string) {
		selectedTestLabel = label;
	}

	function handleCloseDetail() {
		selectedTestLabel = null;
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<div class="dashboard-layout">
	<!-- Sidebar -->
	{#if patientData}
		<Sidebar
			patients={patientData.patients}
			{selectedPatientId}
			onSelectPatient={handleSelectPatient}
			isOpen={sidebarOpen}
			onToggle={toggleSidebar}
		/>
	{/if}

	<!-- Main Content -->
	<main class="main-content">
		<!-- Header with menu toggle -->
		<header class="app-header">
			<button class="menu-btn" onclick={() => toggleSidebar()} aria-label="Toggle patients menu">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="3" y1="6" x2="21" y2="6"></line>
					<line x1="3" y1="12" x2="21" y2="12"></line>
					<line x1="3" y1="18" x2="21" y2="18"></line>
				</svg>
			</button>
			<h1>Lab<span class="highlight">Intelligence</span></h1>
			{#if selectedPatient}
				<div class="header-divider"></div>
				<span class="active-patient-name">{selectedPatient.name}</span>
			{/if}
		</header>

		<!-- Content -->
		<div class="content-viewport">
			{#if loading}
				<div class="center-state">
					<div class="loader"></div>
					<p>Initializing analysis engine...</p>
				</div>
			{:else if error}
				<div class="center-state error">
					<p>System Error: {error}</p>
				</div>
			{:else if selectedPatient}
				<div class="dashboard-split">
					<div class="main-column">
						{#if selectedTestLabel}
							{@const testHistory = analyzedTests.filter(t => t.label === selectedTestLabel)}
							<TestDetailView 
								label={selectedTestLabel} 
								history={testHistory} 
								onClose={handleCloseDetail} 
							/>
						{:else}
							<PatientHeader patient={selectedPatient} />
							<div class="scrollable-grid">
								<TestHistory 
									tests={analyzedTests} 
									onSelectTest={handleSelectTest} 
								/>
							</div>
						{/if}
					</div>
					<aside class="ai-sidebar">
						<MedicalInsights patient={selectedPatient} latestTests={latestTestsOnly} />
					</aside>
				</div>
			{:else}
				<div class="center-state">
					<p>Select a patient record to begin analysis</p>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	.dashboard-layout {
		display: flex;
		width: 100vw;
		height: 100vh;
		background-color: #0f172a;
		overflow: hidden;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: 0;
	}

	.app-header {
		display: flex;
		align-items: center;
		height: 64px;
		padding: 0 1.5rem;
		background-color: #1e293b;
		border-bottom: 1px solid #334155;
		flex-shrink: 0;
	}

	.app-header h1 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		color: #e2e8f0;
		letter-spacing: -0.025em;
	}

	.highlight {
		color: #10b981;
	}

	.header-divider {
		width: 1px;
		height: 24px;
		background-color: #334155;
		margin: 0 1.5rem;
	}

	.active-patient-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #94a3b8;
	}

	.menu-btn {
		display: none;
		background: none;
		border: none;
		color: #e2e8f0;
		cursor: pointer;
		padding: 0.5rem;
		margin-right: 1rem;
		border-radius: 0.5rem;
		transition: background-color 150ms ease-in-out;
	}

	.content-viewport {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.dashboard-split {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 1rem;
		height: 100%;
		padding: 1rem;
		overflow: hidden;
	}

	.main-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
		height: 100%;
	}

	.ai-sidebar {
		height: 100%;
		min-width: 0;
	}

	.scrollable-grid {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
		padding-right: 0.25rem;
	}

	/* Scrollbar styling */
	.scrollable-grid::-webkit-scrollbar {
		width: 6px;
	}
	.scrollable-grid::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollable-grid::-webkit-scrollbar-thumb {
		background: #334155;
		border-radius: 10px;
	}

	.center-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 1rem;
		color: #64748b;
	}

	.loader {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(16, 185, 129, 0.1);
		border-top-color: #10b981;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 1200px) {
		.dashboard-split {
			grid-template-columns: 1fr 320px;
		}
	}

	@media (max-width: 1024px) {
		.dashboard-split {
			grid-template-columns: 1fr;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
		}
		.ai-sidebar {
			order: -1; /* Keep AI at top on mobile */
			height: auto;
		}
	}

	@media (max-width: 768px) {
		.menu-btn {
			display: flex;
		}
		.header-divider {
			display: none;
		}
	}
</style>
