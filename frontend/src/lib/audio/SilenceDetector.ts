/**
 * © AngelaMos | 2026
 * Monitors audio levels to detect when user stops speaking
 */

export interface SilenceDetectorOptions {
	silenceThreshold: number;
	silenceDuration: number;
	minSpeechDuration: number;
}

const DEFAULT_OPTIONS: SilenceDetectorOptions = {
	silenceThreshold: 0.08,
	silenceDuration: 850,
	minSpeechDuration: 500,
};

export class SilenceDetector {
	private options: SilenceDetectorOptions;
	private silenceStart: number | null = null;
	private speechStart: number | null = null;
	private hasSpeechStarted = false;

	public onSilenceDetected?: () => void;
	public onSpeechStarted?: () => void;

	constructor(options: Partial<SilenceDetectorOptions> = {}) {
		this.options = { ...DEFAULT_OPTIONS, ...options };
	}

	update(audioLevel: number): boolean {
		const now = Date.now();

		if (audioLevel >= this.options.silenceThreshold) {
			this.silenceStart = null;

			if (!this.hasSpeechStarted) {
				this.hasSpeechStarted = true;
				this.speechStart = now;
				this.onSpeechStarted?.();
			}
			return false;
		}

		if (!this.hasSpeechStarted) {
			return false;
		}

		if (
			this.speechStart &&
			now - this.speechStart < this.options.minSpeechDuration
		) {
			return false;
		}

		if (!this.silenceStart) {
			this.silenceStart = now;
		}

		if (now - this.silenceStart >= this.options.silenceDuration) {
			this.onSilenceDetected?.();
			return true;
		}

		return false;
	}

	reset(): void {
		this.silenceStart = null;
		this.speechStart = null;
		this.hasSpeechStarted = false;
	}

	updateOptions(options: Partial<SilenceDetectorOptions>): void {
		this.options = { ...this.options, ...options };
	}
}
