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
	<div class="details">
		<div class="detail-item">
			<span class="label">Patient ID</span>
			<span class="value">{patient.id}</span>
		</div>
		<div class="detail-item">
			<span class="label">Gender</span>
			<span class="value">{genderDisplay}</span>
		</div>
		<div class="detail-item">
			<span class="label">Age</span>
			<span class="value">{age} years</span>
		</div>
		<div class="detail-item">
			<span class="label">Person NR</span>
			<span class="value">{patient.personnummer}</span>
		</div>
		<div class="detail-item">
			<span class="label">Born</span>
			<span class="value">{new Date(patient.birth_date).toLocaleDateString('sv-SE')}</span>
		</div>
	</div>
</div>

<style>
	.patient-header {
		background-color: #1e293b;
		border: 1px solid #334155;
		border-radius: 0.5rem;
		padding: 1rem 1.25rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.details {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		align-items: center;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.label {
		font-size: 0.65rem;
		font-weight: 700;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #e2e8f0;
	}

	@media (max-width: 640px) {
		.details {
			gap: 1rem;
		}
	}
</style>
