import type { ReferenceData, PatientData } from '../types/medical';

let referenceDataCache: ReferenceData | null = null;
let patientDataCache: PatientData | null = null;

export async function loadReferenceData(): Promise<ReferenceData> {
	if (referenceDataCache) return referenceDataCache;

	const response = await fetch('/good_reference.json');
	if (!response.ok) throw new Error('Failed to load reference data');

	referenceDataCache = await response.json();
	return referenceDataCache;
}

export async function loadPatientData(): Promise<PatientData> {
	if (patientDataCache) return patientDataCache;

	const response = await fetch('/patient_data.json');
	if (!response.ok) throw new Error('Failed to load patient data');

	patientDataCache = await response.json();
	return patientDataCache;
}

export function clearCache(): void {
	referenceDataCache = null;
	patientDataCache = null;
}
