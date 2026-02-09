// ===================
// © AngelaMos | 2026
// ollama.client.ts
// ===================

import { getAngelaConfig } from "../config";
import type { OllamaMessage, OllamaStreamChunk } from "../types";

export async function* streamChat(
	messages: OllamaMessage[],
	signal?: AbortSignal,
): AsyncGenerator<string, string, unknown> {
	const config = getAngelaConfig();

	const response = await fetch(`${config.api.baseUrl}/v1/chat`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			messages,
			stream: true,
		}),
		signal,
	});

	if (!response.ok) {
		throw new Error(`Chat request failed: ${response.status}`);
	}

	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error("No response body");
	}

	const decoder = new TextDecoder();
	let fullResponse = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		const chunk = decoder.decode(value, { stream: true });
		const lines = chunk.split("\n").filter((line) => line.trim());

		for (const line of lines) {
			try {
				const data: OllamaStreamChunk = JSON.parse(line);
				if (data.message?.content) {
					fullResponse += data.message.content;
					yield data.message.content;
				}
			} catch {}
		}
	}

	return fullResponse;
}

export async function chat(messages: OllamaMessage[]): Promise<string> {
	let result = "";
	for await (const chunk of streamChat(messages)) {
		result += chunk;
	}
	return result;
}

export async function checkHealth(): Promise<boolean> {
	const config = getAngelaConfig();
	try {
		const response = await fetch(`${config.api.baseUrl}/health`);
		return response.ok;
	} catch {
		return false;
	}
}
