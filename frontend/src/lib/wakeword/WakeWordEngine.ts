/**
 * © AngelaMos | 2026
 * Uses Angela-Wake WebSocket server for "angela" wake word detection.
 */

import { getAngelaConfig } from "../../config";
import { logger } from "../debug";

const CHUNK_MS = 80;

export class WakeWordEngine {
	private ws: WebSocket | null = null;
	private audioContext: AudioContext | null = null;
	private workletNode: AudioWorkletNode | null = null;
	private stream: MediaStream | null = null;
	private sourceNode: MediaStreamAudioSourceNode | null = null;
	private isListening = false;
	private reconnectTimer: number | null = null;

	public onWakeWord?: () => void;

	async initialize(): Promise<void> {
		const config = getAngelaConfig();
		const wsEndpoint = `${config.api.wsBaseUrl}/ws/wake`;

		try {
			logger.wake.log("Connecting to Angela-Wake...");
			await this.connect(wsEndpoint);

			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
				},
			});

			this.audioContext = new AudioContext();
			const sampleRate = this.audioContext.sampleRate;
			const chunkSamples = Math.floor((sampleRate * CHUNK_MS) / 1000);

			logger.wake.log(
				`Audio sample rate: ${sampleRate}Hz, chunk size: ${chunkSamples}`,
			);

			const workletCode = `
        class AudioChunkProcessor extends AudioWorkletProcessor {
          constructor() {
            super()
            this.buffer = new Float32Array(0)
            this.chunkSize = ${chunkSamples}
            this.enabled = false
            this.port.onmessage = (e) => {
              if (e.data === 'start') {
                this.buffer = new Float32Array(0)
                this.enabled = true
              } else if (e.data === 'stop') {
                this.enabled = false
              }
            }
          }

          process(inputs) {
            if (!this.enabled) return true
            const input = inputs[0]
            if (input.length > 0 && input[0].length > 0) {
              const samples = input[0]
              const newBuffer = new Float32Array(this.buffer.length + samples.length)
              newBuffer.set(this.buffer)
              newBuffer.set(samples, this.buffer.length)
              this.buffer = newBuffer

              while (this.buffer.length >= this.chunkSize) {
                const chunk = this.buffer.slice(0, this.chunkSize)
                this.buffer = this.buffer.slice(this.chunkSize)

                const int16 = new Int16Array(chunk.length)
                for (let i = 0; i < chunk.length; i++) {
                  int16[i] = Math.max(-32768, Math.min(32767, Math.floor(chunk[i] * 32767)))
                }
                this.port.postMessage(int16.buffer, [int16.buffer])
              }
            }
            return true
          }
        }
        registerProcessor('audio-chunk-processor', AudioChunkProcessor)
      `;

			const blob = new Blob([workletCode], { type: "application/javascript" });
			const url = URL.createObjectURL(blob);
			await this.audioContext.audioWorklet.addModule(url);
			URL.revokeObjectURL(url);

			this.workletNode = new AudioWorkletNode(
				this.audioContext,
				"audio-chunk-processor",
			);
			this.workletNode.port.onmessage = (e) => {
				if (this.ws?.readyState === WebSocket.OPEN && this.isListening) {
					this.ws.send(e.data);
				}
			};

			logger.wake.log("Angela-Wake initialized");
		} catch (error) {
			logger.wake.error("Failed to initialize:", error);
			throw error;
		}
	}

	private connect(endpoint: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.ws = new WebSocket(endpoint);

			this.ws.onopen = () => {
				logger.wake.log("WebSocket connected");
				resolve();
			};

			this.ws.onerror = (e) => {
				logger.wake.error("WebSocket error:", e);
				reject(e);
			};

			this.ws.onclose = () => {
				logger.wake.log("WebSocket closed");
				if (this.isListening) {
					this.scheduleReconnect(endpoint);
				}
			};

			this.ws.onmessage = (e) => {
				try {
					const data = JSON.parse(e.data);
					if (data.detected) {
						logger.wake.log(
							`Wake word detected: ${data.model} (${data.score.toFixed(3)})`,
						);
						this.onWakeWord?.();
					}
				} catch {
					logger.wake.error("Failed to parse message");
				}
			};
		});
	}

	private scheduleReconnect(endpoint: string): void {
		if (this.reconnectTimer) return;
		this.reconnectTimer = window.setTimeout(async () => {
			this.reconnectTimer = null;
			try {
				await this.connect(endpoint);
			} catch {
				this.scheduleReconnect(endpoint);
			}
		}, 2000);
	}

	async start(): Promise<void> {
		if (!this.audioContext || !this.workletNode || !this.stream) return;
		if (this.isListening) return;

		if (!this.sourceNode) {
			this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
			this.sourceNode.connect(this.workletNode);
		}

		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send("reset");
		}

		this.workletNode.port.postMessage("start");
		this.isListening = true;
		logger.wake.log("Listening for wake word");
	}

	stop(): void {
		this.workletNode?.port.postMessage("stop");
		this.isListening = false;
		logger.wake.log("Stopped listening");
	}

	isActive(): boolean {
		return this.isListening;
	}

	isInitialized(): boolean {
		return this.ws !== null && this.audioContext !== null;
	}

	async dispose(): Promise<void> {
		this.stop();
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		if (this.sourceNode) {
			this.sourceNode.disconnect();
			this.sourceNode = null;
		}
		if (this.stream) {
			for (const track of this.stream.getTracks()) {
				track.stop();
			}
			this.stream = null;
		}
		if (this.audioContext) {
			await this.audioContext.close();
			this.audioContext = null;
		}
		this.workletNode = null;
	}
}

export class MockWakeWordEngine {
	public onWakeWord?: () => void;
	private isListening = false;
	private handler: ((e: KeyboardEvent) => void) | null = null;

	async initialize(): Promise<void> {
		logger.wake.log("Using keyboard trigger (Ctrl+Shift+A)");

		this.handler = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key === "A") {
				e.preventDefault();
				logger.wake.log("Manual trigger via Ctrl+Shift+A");
				this.onWakeWord?.();
			}
		};

		window.addEventListener("keydown", this.handler);
	}

	async start(): Promise<void> {
		this.isListening = true;
	}

	stop(): void {
		this.isListening = false;
	}

	isActive(): boolean {
		return this.isListening;
	}

	async dispose(): Promise<void> {
		if (this.handler) {
			window.removeEventListener("keydown", this.handler);
			this.handler = null;
		}
		this.isListening = false;
	}
}

export async function createWakeWordEngine(): Promise<
	WakeWordEngine | MockWakeWordEngine
> {
	const engine = new WakeWordEngine();
	try {
		await engine.initialize();
		return engine;
	} catch {
		logger.wake.log("Angela-Wake failed - using keyboard fallback");
		const mock = new MockWakeWordEngine();
		await mock.initialize();
		return mock;
	}
}
