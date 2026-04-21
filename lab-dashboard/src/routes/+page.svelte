<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import PatientHeader from '$lib/components/ui/PatientHeader.svelte';
	import TestHistory from '$lib/components/sections/TestHistory.svelte';
	import { loadReferenceData, loadPatientData } from '$lib/services/dataLoader';
	import { analyzePatient } from '$lib/services/analysisService';
	import type { ReferenceData, PatientData } from '$lib/types/medical';

	// State
	let selectedPatientId = $state<string | null>(null);
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

	function handleSelectPatient(patientId: string) {
		selectedPatientId = patientId;
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
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<line x1="3" y1="6" x2="21" y2="6"></line>
					<line x1="3" y1="12" x2="21" y2="12"></line>
					<line x1="3" y1="18" x2="21" y2="18"></line>
				</svg>
			</button>
			<h1>Lab Analysis Dashboard</h1>
		</header>

		<!-- Content -->
		<div class="content-wrapper">
			{#if loading}
				<div class="loading">
					<p>Loading data...</p>
				</div>
			{:else if error}
				<div class="error">
					<p>Error: {error}</p>
				</div>
			{:else if selectedPatient}
				<PatientHeader patient={selectedPatient} />
				<TestHistory tests={analyzedTests} />
			{:else}
				<div class="no-selection">
					<p>Select a patient to view their test results</p>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	.dashboard-layout {
		display: flex;
		width: 100%;
		height: 100vh;
		background-color: #0f172a;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.app-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background-color: #1e293b;
		border-bottom: 1px solid #334155;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
	}

	.app-header h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #e2e8f0;
	}

	.menu-btn {
		display: none;
		background: none;
		border: none;
		color: #e2e8f0;
		cursor: pointer;
		padding: 0.5rem;
		width: 40px;
		height: 40px;
		border-radius: 0.5rem;
		transition: background-color 150ms ease-in-out;
	}

	.menu-btn:hover {
		background-color: #334155;
	}

	@media (max-width: 768px) {
		.menu-btn {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.app-header h1 {
			font-size: 1.25rem;
		}
	}

	.content-wrapper {
		flex: 1;
		overflow-y: auto;
		padding: 2rem;
	}

	.loading,
	.error,
	.no-selection {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
	}

	.loading p,
	.error p,
	.no-selection p {
		font-size: 1rem;
		color: #94a3b8;
		margin: 0;
	}

	.error p {
		color: #dc2626;
	}

	@media (max-width: 768px) {
		.dashboard-layout {
			flex-direction: column;
		}

		.content-wrapper {
			padding: 1rem;
		}
	}
</style>

