export interface ReferenceInterval {
	gender: 'male' | 'female' | 'both';
	age_days_min: number | null;
	age_days_max: number | null;
	reference_min: number;
	reference_max: number;
	unit: string;
	raw_age_range: string;
}

export interface ReferenceTest {
	label: string;
	test_name: string;
	intervals: ReferenceInterval[];
}

export interface ReferenceData {
	metadata: {
		generated_at: string;
		source: string;
		description: string;
		age_unit: string;
		notes: string;
	};
	tests: ReferenceTest[];
}

export interface PatientTest {
	label: string;
	value: number;
	unit: string;
	date: string;
}

export interface Patient {
	id: string;
	personnummer: string;
	name: string;
	gender: 'male' | 'female';
	birth_date: string;
	tests: PatientTest[];
}

export interface PatientData {
	metadata: {
		generated_at: string;
		description: string;
		total_patients: number;
		patient_age_range: string;
		health_status_distribution: {
			healthy: number;
			with_abnormalities: number;
		};
	};
	patients: Patient[];
}

export type TestStatus = 'normal' | 'high' | 'low' | 'unknown';

export interface TestAnalysis {
	label: string;
	value: number;
	unit: string;
	date: string;
	status: TestStatus;
	reference_min: number | null;
	reference_max: number | null;
	raw_age_range: string | null;
}

export interface MatchedInterval {
	interval: ReferenceInterval;
	testRef: ReferenceTest;
}
