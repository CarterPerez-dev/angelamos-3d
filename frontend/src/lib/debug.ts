// ===================
// © AngelaMos | 2026
// debug.ts
// ===================

import { getAngelaConfig } from "../config";

type LogLevel = "log" | "warn" | "error";

const createLogger = (prefix: string) => {
	const log = (level: LogLevel, ...args: unknown[]) => {
		const config = getAngelaConfig();
		if (!config.debug && level === "log") return;
		console[level](`[Angela:${prefix}]`, ...args);
	};

	return {
		log: (...args: unknown[]) => log("log", ...args),
		warn: (...args: unknown[]) => log("warn", ...args),
		error: (...args: unknown[]) => log("error", ...args),
	};
};

export const logger = {
	page: createLogger("Page"),
	audio: createLogger("Audio"),
	wake: createLogger("Wake"),
	animation: createLogger("Anim"),
	pipeline: createLogger("Pipeline"),
};
