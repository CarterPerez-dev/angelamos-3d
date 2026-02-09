// ===================
// © AngelaMos | 2026
// AnimationManager.ts
// ===================

import type { VRM } from "@pixiv/three-vrm";
import * as THREE from "three";
import type { AnimationState } from "./AnimationController";
import { loadMixamoAnimation } from "./loadMixamoAnimation";

const BASE_IDLE = "/animations/idle/Mma Idle.fbx";

const IDLE_ACTIONS = [
	"/animations/idle/Armada.fbx",
	"/animations/idle/Capoeira.fbx",
	"/animations/idle/Chapaeu De Couro.fbx",
	"/animations/idle/Martelo Do Chau.fbx",
	"/animations/idle/Run To Flip.fbx",
	"/animations/idle/Spin Flip Kick.fbx",
];

const SPEAKING_ANIMATIONS = [
	"/animations/speaking/Breakdance 1990.fbx",
	"/animations/speaking/Breakdance Freeze Var 3.fbx",
	"/animations/speaking/Breakdance Freezes.fbx",
	"/animations/speaking/Flair.fbx",
	[
		"/animations/speaking/Headspin Start.fbx",
		"/animations/speaking/Headspin End.fbx",
	],
];

const LISTENING_ANIMATIONS = [
	"/animations/listening-thinking/Bashful.fbx",
	"/animations/listening-thinking/Talking On Phone.fbx",
];

const IDLE_REST_DURATION = 22000;

export class AnimationManager {
	private vrm: VRM;
	private mixer: THREE.AnimationMixer;
	private clips: Map<string, THREE.AnimationClip> = new Map();
	private currentAction: THREE.AnimationAction | null = null;
	private currentState: AnimationState = "idle";
	private isLoaded = false;
	private timeoutId: ReturnType<typeof setTimeout> | null = null;
	private actionQueue: string[] = [];

	constructor(vrm: VRM) {
		this.vrm = vrm;
		this.mixer = new THREE.AnimationMixer(vrm.scene);
	}

	async loadAllAnimations(): Promise<void> {
		console.log("Loading animations...");

		const allPaths = [
			BASE_IDLE,
			...IDLE_ACTIONS,
			...SPEAKING_ANIMATIONS.flat(),
			...LISTENING_ANIMATIONS,
		];

		for (const path of allPaths) {
			try {
				const clip = await loadMixamoAnimation(path, this.vrm);
				this.clips.set(path, clip);
				console.log(`Loaded: ${path}`);
			} catch (err) {
				console.warn(`Failed to load ${path}:`, err);
			}
		}

		this.isLoaded = true;
		console.log("All animations loaded!");
		this.startIdleLoop();
	}

	setState(state: AnimationState): void {
		if (this.currentState === state) return;
		console.log(`AnimationManager: ${this.currentState} -> ${state}`);
		this.currentState = state;

		this.clearSchedule();
		this.actionQueue = [];

		switch (state) {
			case "idle":
				this.startIdleLoop();
				break;
			case "listening":
			case "thinking":
				this.playRandomFrom(LISTENING_ANIMATIONS, true);
				break;
			case "speaking":
				this.startSpeakingLoop();
				break;
			case "error":
				this.playClip(BASE_IDLE);
				break;
		}
	}

	private startIdleLoop(): void {
		if (!this.isLoaded || this.currentState !== "idle") return;
		this.playClip(BASE_IDLE);
		this.timeoutId = setTimeout(() => this.playIdleCombo(), IDLE_REST_DURATION);
	}

	private playIdleCombo(): void {
		if (this.currentState !== "idle") return;

		const comboSize = 1 + Math.floor(Math.random() * 2);
		const shuffled = [...IDLE_ACTIONS].sort(() => Math.random() - 0.5);
		this.actionQueue = shuffled.slice(0, comboSize);

		this.playNextInQueue();
	}

	private playNextInQueue(): void {
		if (this.currentState !== "idle") return;

		if (this.actionQueue.length === 0) {
			this.startIdleLoop();
			return;
		}

		const nextPath = this.actionQueue.shift();
		if (!nextPath) return;
		const clip = this.clips.get(nextPath);
		if (!clip) {
			this.playNextInQueue();
			return;
		}

		this.playClipOnce(clip, () => this.playNextInQueue());
	}

	private startSpeakingLoop(): void {
		if (!this.isLoaded || this.currentState !== "speaking") return;
		this.playRandomFrom(SPEAKING_ANIMATIONS, false);
	}

	private playRandomFrom(
		animations: (string | string[])[],
		loop: boolean,
	): void {
		const pick = animations[Math.floor(Math.random() * animations.length)];

		if (Array.isArray(pick)) {
			this.actionQueue = [...pick];
			this.playChainedQueue(loop);
		} else {
			const clip = this.clips.get(pick);
			if (clip) {
				if (loop) {
					this.playClip(pick);
				} else {
					this.playClipOnce(clip, () => {
						if (this.currentState === "speaking") {
							this.startSpeakingLoop();
						}
					});
				}
			}
		}
	}

	private playChainedQueue(loopAfter: boolean): void {
		if (this.actionQueue.length === 0) {
			if (this.currentState === "speaking") {
				this.startSpeakingLoop();
			} else if (
				loopAfter &&
				(this.currentState === "listening" || this.currentState === "thinking")
			) {
				this.playRandomFrom(LISTENING_ANIMATIONS, true);
			}
			return;
		}

		const nextPath = this.actionQueue.shift();
		if (!nextPath) return;
		const clip = this.clips.get(nextPath);
		if (!clip) {
			this.playChainedQueue(loopAfter);
			return;
		}

		this.playClipOnce(clip, () => this.playChainedQueue(loopAfter));
	}

	private playClip(path: string): void {
		const clip = this.clips.get(path);
		if (!clip) return;

		const newAction = this.mixer.clipAction(clip);
		newAction.reset();
		newAction.setLoop(THREE.LoopRepeat, Infinity);

		if (this.currentAction && this.currentAction !== newAction) {
			this.currentAction.crossFadeTo(newAction, 0.3, false);
		}

		newAction.play();
		this.currentAction = newAction;
	}

	private playClipOnce(
		clip: THREE.AnimationClip,
		onComplete: () => void,
	): void {
		const newAction = this.mixer.clipAction(clip);
		newAction.reset();
		newAction.setLoop(THREE.LoopOnce, 1);
		newAction.clampWhenFinished = true;

		if (this.currentAction && this.currentAction !== newAction) {
			this.currentAction.crossFadeTo(newAction, 0.3, false);
		}

		const onFinished = (e: { action: THREE.AnimationAction }) => {
			if (e.action === newAction) {
				this.mixer.removeEventListener("finished", onFinished);
				onComplete();
			}
		};
		this.mixer.addEventListener("finished", onFinished);

		newAction.play();
		this.currentAction = newAction;
	}

	private clearSchedule(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

	update(delta: number): void {
		this.mixer.update(delta);
	}

	dispose(): void {
		this.clearSchedule();
		this.mixer.stopAllAction();
	}
}
