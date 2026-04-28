import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { prompt } = await request.json();

	try {
		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			body: JSON.stringify({
				model: 'gemma4:e2b', // Using the model specified by user
				prompt: prompt,
				stream: true,
                system: "Du är en expert på medicinsk labbanalys. Svara alltid på svenska. Fokusera på att rekommendera nya prover baserat på avvikelser."
			})
		});

		if (!response.ok) {
			return json({ error: 'Ollama not responding' }, { status: 500 });
		}

		// Return the stream directly to the client
		return new Response(response.body, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});
	} catch (err) {
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
