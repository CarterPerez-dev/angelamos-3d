// ===================
// © AngelaMos | 2026
// angela.types.ts
// ===================

export interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
}

export interface AngelaSettings {
	wakeWordSensitivity: number;
	silenceThreshold: number;
	silenceDuration: number;
}

export interface TranscriptResult {
	text: string;
	duration_ms?: number;
}

export interface OllamaMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export interface OllamaRequest {
	messages: OllamaMessage[];
	stream: boolean;
}

export interface OllamaStreamChunk {
	model: string;
	message: { role: string; content: string };
	done: boolean;
}

export type AngelaStatus =
	| "initializing"
	| "idle"
	| "listening"
	| "processing"
	| "thinking"
	| "speaking"
	| "error";

export interface AngelaConfig {
	debug: boolean;
	api: {
		baseUrl: string;
		wsBaseUrl: string;
	};
	vrm: {
		modelPath: string;
	};
	audio: {
		sampleRate: number;
		silenceThreshold: number;
		silenceDuration: number;
		minSpeechDuration: number;
	};
	animation: {
		blinkMinInterval: number;
		blinkMaxInterval: number;
	};
	scene: {
		backgroundColor: number;
		cameraFov: number;
		cameraPosition: [number, number, number];
		cameraTarget: [number, number, number];
	};
}
