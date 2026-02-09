// ===================
// © AngelaMos | 2026
// whisper.client.ts
// ===================

import { getAngelaConfig } from "../config";
import type { TranscriptResult } from "../types";

export async function transcribeAudio(
	audioBlob: Blob,
): Promise<TranscriptResult> {
	const config = getAngelaConfig();
	const formData = new FormData();
	formData.append("file", audioBlob, "audio.wav");

	const response = await fetch(`${config.api.baseUrl}/v1/stt`, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Transcription failed: ${response.status}`);
	}

	const data = await response.json();
	return {
		text: data.text?.trim() || "",
		duration_ms: data.duration * 1000,
	};
}
