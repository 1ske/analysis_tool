import type { TestAnalysis, Patient } from '../types/medical';

export interface InsightStreamResponse {
	text: string;
	done: boolean;
}

/**
 * Construct a Swedish prompt for the medical analysis
 */
export function constructInsightPrompt(patient: Patient, latestTests: TestAnalysis[]): string {
	const testSummary = latestTests
		.map((t) => {
			const status = t.status.toUpperCase();
			const direction = status === 'HIGH' ? 'FÖRHÖJT' : status === 'LOW' ? 'LÅGT' : 'NORMAL';
			return `- ${t.label}: ${t.value} ${t.unit} [Status: ${status} (${direction}), Ref: ${t.reference_min}-${t.reference_max}]`;
		})
		.join('\n');

	return `
Du är en svensk expertläkare inom klinisk kemi. Din uppgift är att analysera provsvar och ge korta rekomendationer på uppföljande prover baserat på avvikelser från referensvärdena.

Patient: ${patient.gender === 'male' ? 'Man' : 'Kvinna'}, ${new Date().getFullYear() - new Date(patient.birth_date).getFullYear()} år.

Aktuella resultat:
${testSummary}

Dina strikta instruktioner:
1. Kontrollera noga om ett värde är markerat som LÅGT eller FÖRHÖJT.
2. Om ett värde är LÅGT, beskriv det som lågt eller sänkt. Skriv ALDRIG att ett LÅGT värde är förhöjt.
3. Ge en kort medicinsk förklaring till avvikelsen (t.ex. vid lågt Hb, nämn anemi).
4. Rekommendera ALLTID specifika uppföljande prover baserat på avvikelsen. Detta är viktigt. Hela idén är att ge konkreta rekommendationer på fler prover baserat på provresultaten som kan hjälpa till att utreda avvikelsen vidare.
5. Svara på professionell svenska, var extremt koncis och gå direkt på analysen. Se till att stava rätt. Du är också väldigt svensk, alltså stavar du alltid rätt på svenska.

Exempel:
"P-Natrium är lågt (${latestTests.find(t => t.label.includes('Natrium'))?.value}), vilket kan tyda på vätskeretention eller natriumförlust. Bör följas upp med kontroll av vätskestatus."
`;
}


/**
 * Stream insights from Ollama
 */
export async function* streamMedicalInsights(prompt: string, signal?: AbortSignal) {
	const response = await fetch('/api/analyze', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ prompt }),
		signal
	});

	if (!response.ok) throw new Error('Misslyckades att kontakta AI-motorn');

	const reader = response.body?.getReader();
	const decoder = new TextDecoder();

	if (!reader) return;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		const chunk = decoder.decode(value, { stream: true });
		const lines = chunk.split('\n');

		for (const line of lines) {
			if (!line.trim()) continue;
			try {
				const json = JSON.parse(line);
				if (json.response) {
					yield json.response;
				}
			} catch (e) {
				console.error('Error parsing JSON chunk', e);
			}
		}
	}
}
