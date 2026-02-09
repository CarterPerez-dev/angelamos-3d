// ===================
// © AngelaMos | 2026
// config.ts
// ===================

import type { AngelaConfig, AngelaSettings } from "../types";

const STORAGE_KEY = "angela-settings";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export const DEFAULT_SETTINGS: AngelaSettings = {
	wakeWordSensitivity: 0.5,
	silenceThreshold: 0.08,
	silenceDuration: 850,
};

export const getAngelaConfig = (): AngelaConfig => ({
	debug: import.meta.env.VITE_ANGELA_DEBUG === "true",

	api: {
		baseUrl: API_BASE,
		wsBaseUrl: `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}${API_BASE}`,
	},

	vrm: {
		modelPath: "/vrm/angela.vrm",
	},

	audio: {
		sampleRate: 16000,
		silenceThreshold: 0.08,
		silenceDuration: 850,
		minSpeechDuration: 500,
	},

	animation: {
		blinkMinInterval: 3,
		blinkMaxInterval: 5,
	},

	scene: {
		backgroundColor: 0x080808,
		cameraFov: 99,
		cameraPosition: [0, 1.3, 2.0],
		cameraTarget: [0, 1.3, 0],
	},
});

export const loadSettings = (): AngelaSettings => {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
	}
	return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Partial<AngelaSettings>): void => {
	const current = loadSettings();
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({ ...current, ...settings }),
	);
};
