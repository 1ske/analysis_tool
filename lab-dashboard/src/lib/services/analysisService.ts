import type {
	ReferenceData,
	Patient,
	PatientTest,
	TestAnalysis,
	TestStatus,
	ReferenceInterval
} from '../types/medical';

/**
 * Calculate age in days between two dates
 */
export function calculateAgeDays(birthDate: Date, testDate: Date): number {
	const timeDiff = testDate.getTime() - birthDate.getTime();
	return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Normalize test labels for robust matching.
 * Removes common lab prefixes, content in parentheses, and non-alphanumeric characters.
 */
function normalizeLabel(label: string): string {
	return label
		.toLowerCase()
		// Remove content in parentheses e.g. "T4 (fritt)" -> "T4"
		.replace(/\([^)]*\)/g, '')
		// Remove common lab prefixes followed by dashes or spaces
		.replace(/^(b|p|s|erc|fp|ab|p\/s)[-–—\s]+/g, '')
		// Remove all non-alphanumeric characters for comparison
		.replace(/[^a-z0-9]/g, '')
		.trim();
}

/**
 * Find matching reference interval for a test based on patient age/gender.
 * Generalizes by pooling intervals from all tests that match the normalized label.
 */
export function findMatchingInterval(
	referenceData: ReferenceData,
	testLabel: string,
	ageDays: number,
	gender: 'male' | 'female'
) {
	const normalizedTestLabel = normalizeLabel(testLabel);
	
	// Collect all tests that might match this label
	const matchingTests = referenceData.tests.filter((t) => {
		const normalizedRefLabel = normalizeLabel(t.label);
		const normalizedRefName = normalizeLabel(t.test_name);
		return normalizedRefLabel === normalizedTestLabel || normalizedRefName === normalizedTestLabel;
	});

	if (matchingTests.length === 0) return null;

	// Flatten all intervals from all matching tests
	const allIntervals: ReferenceInterval[] = matchingTests.flatMap(t => t.intervals);

	// 1. Try to find an exact age match
	const candidateIntervals = allIntervals.filter(interval => {
		// Gender filter: patient gender or 'both'
		if (interval.gender !== 'both' && interval.gender !== gender) return false;

		// Age filter: within range [min, max)
		const ageMin = interval.age_days_min ?? -1;
		const ageMax = interval.age_days_max ?? Infinity;
		return ageDays >= ageMin && ageDays < ageMax;
	});

	if (candidateIntervals.length > 0) {
		// Prioritize gender match: exact gender > 'both'
		candidateIntervals.sort((a, b) => {
			if (a.gender === gender && b.gender !== gender) return -1;
			if (a.gender !== gender && b.gender === gender) return 1;
			return 0;
		});
		return { interval: candidateIntervals[0], testRef: matchingTests[0] };
	}

	// 2. Fallback: If no exact age match, pick the closest relevant interval
	if (allIntervals.length > 0) {
		const relevantGenders = allIntervals.filter(i => i.gender === gender || i.gender === 'both');
		if (relevantGenders.length > 0) {
			// Sort by age to find boundaries
			const sortedByAge = [...relevantGenders].sort((a, b) => {
				const aMin = a.age_days_min ?? 0;
				const bMin = b.age_days_min ?? 0;
				return aMin - bMin;
			});

			// If older than the highest minimum age in our data, use the oldest range
			const oldest = sortedByAge[sortedByAge.length - 1];
			const oldestMin = oldest.age_days_min ?? 0;
			if (ageDays >= oldestMin) {
				return { interval: oldest, testRef: matchingTests[0] };
			}

			// If younger than the lowest minimum age, use the youngest range
			const youngest = sortedByAge[0];
			const youngestMin = youngest.age_days_min ?? 0;
			if (ageDays < youngestMin) {
				return { interval: youngest, testRef: matchingTests[0] };
			}

			// If in a "gap" between ranges, find the one with the closest boundary
			// (This handles minor gaps in the medical data JSON)
			let closest = sortedByAge[0];
			let minDiff = Infinity;
			for (const interval of sortedByAge) {
				const diff = Math.min(
					Math.abs(ageDays - (interval.age_days_min ?? 0)),
					Math.abs(ageDays - (interval.age_days_max ?? Infinity))
				);
				if (diff < minDiff) {
					minDiff = diff;
					closest = interval;
				}
			}
			return { interval: closest, testRef: matchingTests[0] };
		}
	}

	return null;
}

/**
 * Determine test status based on value and reference interval
 */
export function determineStatus(
	value: number,
	reference_min: number,
	reference_max: number
): TestStatus {
	if (value < reference_min) return 'low';
	if (value > reference_max) return 'high';
	return 'normal';
}

/**
 * Analyze a single patient test against reference data
 */
export function analyzeTest(
	referenceData: ReferenceData,
	patient: Patient,
	test: PatientTest
): TestAnalysis {
	const birthDate = new Date(patient.birth_date);
	const testDate = new Date(test.date);
	const ageDays = calculateAgeDays(birthDate, testDate);

	const matched = findMatchingInterval(referenceData, test.label, ageDays, patient.gender);

	if (!matched) {
		return {
			label: test.label,
			value: test.value,
			unit: test.unit,
			date: test.date,
			status: 'unknown',
			reference_min: null,
			reference_max: null,
			raw_age_range: null
		};
	}

	const { interval } = matched;
	const status = determineStatus(test.value, interval.reference_min, interval.reference_max);

	return {
		label: test.label,
		value: test.value,
		unit: test.unit,
		date: test.date,
		status,
		reference_min: interval.reference_min,
		reference_max: interval.reference_max,
		raw_age_range: interval.raw_age_range
	};
}

/**
 * Analyze all tests for a patient
 */
export function analyzePatient(referenceData: ReferenceData, patient: Patient): TestAnalysis[] {
	return patient.tests.map((test) => analyzeTest(referenceData, patient, test));
}
