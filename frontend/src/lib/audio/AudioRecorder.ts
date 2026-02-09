/**
 * © AngelaMos | 2026
 * Angela AI Assistant - Audio Recorder
 * Records audio from microphone using MediaRecorder API.
 * Outputs WAV format for Whisper compatibility.
 */

import { getAngelaConfig } from "../../config";
import { logger } from "../debug";

export class AudioRecorder {
	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private stream: MediaStream | null = null;
	private audioContext: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private dataArray: Uint8Array<ArrayBuffer> | null = null;

	public onAudioLevel?: (level: number) => void;
	public onComplete?: (blob: Blob) => void;

	private animationFrame: number | null = null;

	async initialize(): Promise<void> {
		const config = getAngelaConfig();

		this.stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: config.audio.sampleRate,
			},
		});

		this.audioContext = new AudioContext({
			sampleRate: config.audio.sampleRate,
		});
		const source = this.audioContext.createMediaStreamSource(this.stream);
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 256;
		source.connect(this.analyser);
		this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

		this.mediaRecorder = new MediaRecorder(this.stream, {
			mimeType: this.getSupportedMimeType(),
		});

		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				this.audioChunks.push(event.data);
			}
		};

		this.mediaRecorder.onstop = async () => {
			const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
			const wavBlob = await this.convertToWav(audioBlob);
			this.onComplete?.(wavBlob);
			this.audioChunks = [];
		};
	}

	private getSupportedMimeType(): string {
		const types = [
			"audio/webm;codecs=opus",
			"audio/webm",
			"audio/ogg",
			"audio/mp4",
		];
		for (const type of types) {
			if (MediaRecorder.isTypeSupported(type)) {
				return type;
			}
		}
		return "audio/webm";
	}

	start(): void {
		if (!this.mediaRecorder) {
			throw new Error("AudioRecorder not initialized");
		}

		if (this.mediaRecorder.state === "recording") {
			logger.audio.log("Already recording, skipping start");
			return;
		}

		this.audioChunks = [];
		this.mediaRecorder.start(100);
		this.startLevelMonitoring();
	}

	stop(): void {
		if (this.mediaRecorder?.state === "recording") {
			this.mediaRecorder.stop();
		}
		this.stopLevelMonitoring();
	}

	getAudioLevel(): number {
		if (!this.analyser || !this.dataArray) return 0;

		this.analyser.getByteFrequencyData(this.dataArray);
		let sum = 0;
		for (let i = 0; i < this.dataArray.length; i++) {
			sum += this.dataArray[i];
		}
		return sum / (this.dataArray.length * 255);
	}

	private startLevelMonitoring(): void {
		const monitor = () => {
			const level = this.getAudioLevel();
			this.onAudioLevel?.(level);
			this.animationFrame = requestAnimationFrame(monitor);
		};
		monitor();
	}

	private stopLevelMonitoring(): void {
		if (this.animationFrame) {
			cancelAnimationFrame(this.animationFrame);
			this.animationFrame = null;
		}
	}

	private async convertToWav(blob: Blob): Promise<Blob> {
		const config = getAngelaConfig();
		const sampleRate = config.audio.sampleRate;

		const arrayBuffer = await blob.arrayBuffer();
		const audioContext = new AudioContext({ sampleRate });
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

		const numChannels = 1;
		const bitsPerSample = 16;
		const samples = audioBuffer.getChannelData(0);

		const buffer = new ArrayBuffer(44 + samples.length * 2);
		const view = new DataView(buffer);

		const writeString = (offset: number, str: string) => {
			for (let i = 0; i < str.length; i++) {
				view.setUint8(offset + i, str.charCodeAt(i));
			}
		};

		writeString(0, "RIFF");
		view.setUint32(4, 36 + samples.length * 2, true);
		writeString(8, "WAVE");
		writeString(12, "fmt ");
		view.setUint32(16, 16, true);
		view.setUint16(20, 1, true);
		view.setUint16(22, numChannels, true);
		view.setUint32(24, sampleRate, true);
		view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
		view.setUint16(32, numChannels * (bitsPerSample / 8), true);
		view.setUint16(34, bitsPerSample, true);
		writeString(36, "data");
		view.setUint32(40, samples.length * 2, true);

		let offset = 44;
		for (let i = 0; i < samples.length; i++) {
			const sample = Math.max(-1, Math.min(1, samples[i]));
			view.setInt16(
				offset,
				sample < 0 ? sample * 0x8000 : sample * 0x7fff,
				true,
			);
			offset += 2;
		}

		await audioContext.close();
		return new Blob([buffer], { type: "audio/wav" });
	}

	dispose(): void {
		this.stopLevelMonitoring();
		if (this.mediaRecorder?.state === "recording") {
			this.mediaRecorder.stop();
		}
		if (this.stream) {
			for (const track of this.stream.getTracks()) {
				track.stop();
			}
		}
		if (this.audioContext) {
			this.audioContext.close();
		}
		this.mediaRecorder = null;
		this.stream = null;
		this.audioContext = null;
		this.analyser = null;
	}
}
