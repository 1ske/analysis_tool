import type { Patient } from '../types/medical';

/**
 * Calculate patient age in years
 */
export function calculateAgeYears(birthDate: Date, referenceDate: Date = new Date()): number {
	let age = referenceDate.getFullYear() - birthDate.getFullYear();
	const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
		age--;
	}

	return Math.max(0, age);
}

/**
 * Format patient display name with age
 */
export function getPatientDisplayName(patient: Patient, referenceDate?: Date): string {
	const birthDate = new Date(patient.birth_date);
	const age = calculateAgeYears(birthDate, referenceDate);
	return `${patient.name} (${age}y)`;
}

/**
 * Sort patients by name
 */
export function sortPatientsByName(patients: Patient[]): Patient[] {
	return [...patients].sort((a, b) => a.name.localeCompare(b.name));
}
