// ===================
// © AngelaMos | 2026
// edgetts.client.ts
// ===================

import { getAngelaConfig } from "../config";

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
	const config = getAngelaConfig();
	const response = await fetch(`${config.api.baseUrl}/v1/tts/synthesize`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ text }),
	});

	if (!response.ok) {
		throw new Error(`TTS error: ${response.status}`);
	}

	return response.arrayBuffer();
}
