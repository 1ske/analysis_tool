<script lang="ts">
	import type { Patient } from '$lib/types/medical';
	import { calculateAgeYears } from '$lib/services/patientService';

	interface Props {
		patient: Patient;
	}

	const { patient }: Props = $props();

	const age = $derived(calculateAgeYears(new Date(patient.birth_date)));
	const genderDisplay = $derived(patient.gender === 'male' ? 'Male' : 'Female');
</script>

<div class="patient-header">
	<div class="info-section">
		<h1>{patient.name}</h1>
		<div class="details">
			<span class="detail-item">
				<span class="label">ID</span>
				<span class="value">{patient.id}</span>
			</span>
			<span class="detail-item">
				<span class="label">Gender</span>
				<span class="value">{genderDisplay}</span>
			</span>
			<span class="detail-item">
				<span class="label">Age</span>
				<span class="value">{age} years</span>
			</span>
			<span class="detail-item">
				<span class="label">Personnel Number</span>
				<span class="value">{patient.personnummer}</span>
			</span>
		</div>
	</div>
</div>

<style>
	.patient-header {
		background-color: #1e293b;
		border: 1px solid #334155;
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.info-section h1 {
		margin: 0 0 1rem 0;
		font-size: 2rem;
		font-weight: 700;
		color: #e2e8f0;
	}

	.details {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.value {
		font-size: 0.95rem;
		font-weight: 500;
		color: #cbd5e1;
	}
</style>
