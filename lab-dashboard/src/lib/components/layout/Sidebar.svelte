<script lang="ts">
	import type { Patient } from '$lib/types/medical';
	import { getPatientDisplayName, sortPatientsByName } from '$lib/services/patientService';

	interface Props {
		patients: Patient[];
		selectedPatientId: string | null;
		onSelectPatient: (patientId: string) => void;
		isOpen: boolean;
		onToggle: () => void;
	}

	const { patients, selectedPatientId, onSelectPatient, isOpen, onToggle }: Props = $props();

	const sortedPatients = $derived(sortPatientsByName(patients));
</script>

<div
	class="sidebar-overlay {isOpen ? 'open' : ''}"
	role="button"
	tabindex="0"
	onclick={() => onToggle()}
	onkeydown={(e) => e.key === 'Escape' && onToggle()}
	aria-label="Close sidebar"
>
	<!-- Empty overlay for mobile click-away -->
</div>

<aside class="sidebar {isOpen ? 'open' : ''}">
	<div class="sidebar-header">
		<h2>Patients</h2>
		<button class="close-btn" onclick={() => onToggle()} aria-label="Close patients menu">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</div>

	<div class="patient-list">
		{#each sortedPatients as patient (patient.id)}
			<button
				class="patient-item {selectedPatientId === patient.id ? 'selected' : ''}"
				onclick={() => {
					onSelectPatient(patient.id);
					onToggle();
				}}
			>
				<span class="patient-name">{getPatientDisplayName(patient)}</span>
				<span class="patient-id">{patient.id}</span>
			</button>
		{/each}
	</div>
</aside>

<style>
	.sidebar-overlay {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 99;
	}

	.sidebar-overlay.open {
		display: block;
	}

	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: 280px;
		background-color: #1e293b;
		border-right: 1px solid #334155;
		display: flex;
		flex-direction: column;
		z-index: 100;
		transform: translateX(-100%);
		transition: transform 250ms ease-in-out;
		box-shadow: 4px 0 6px -1px rgba(0, 0, 0, 0.1);
	}

	.sidebar.open {
		transform: translateX(0);
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 1rem;
		border-bottom: 1px solid #334155;
	}

	.sidebar-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #e2e8f0;
	}

	.close-btn {
		display: none;
		background: none;
		border: none;
		color: #e2e8f0;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		transition: background-color 150ms ease-in-out;
	}

	.close-btn:hover {
		background-color: #334155;
	}

	@media (max-width: 768px) {
		.close-btn {
			display: flex;
		}
	}

	.patient-list {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.patient-item {
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		margin-bottom: 0.25rem;
		background: none;
		border: 1px solid transparent;
		color: #cbd5e1;
		cursor: pointer;
		border-radius: 0.5rem;
		transition: all 150ms ease-in-out;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.patient-item:hover {
		background-color: #334155;
		border-color: #475569;
	}

	.patient-item.selected {
		background-color: #334155;
		border-color: #10b981;
		color: #e2e8f0;
	}

	.patient-name {
		font-weight: 500;
		font-size: 0.9rem;
	}

	.patient-id {
		font-size: 0.75rem;
		color: #94a3b8;
	}

	@media (min-width: 769px) {
		.sidebar {
			position: static;
			transform: none;
			width: 100%;
			max-width: 280px;
		}

		.sidebar-overlay {
			display: none;
		}
	}
</style>
