// ===================
// © AngelaMos | 2026
// AnimationController.ts
// ===================

import type { VRM } from "@pixiv/three-vrm";
import { getAngelaConfig } from "../../config";

export type AnimationState =
	| "idle"
	| "listening"
	| "thinking"
	| "speaking"
	| "error";

export class AnimationController {
	private vrm: VRM;
	private state: AnimationState = "idle";
	private blinkTimer = 0;

	constructor(vrm: VRM) {
		this.vrm = vrm;
	}

	setState(newState: AnimationState): void {
		if (this.state === newState) return;
		this.state = newState;
	}

	update(delta: number): void {
		this.updateBlink(delta);
	}

	private updateBlink(delta: number): void {
		const config = getAngelaConfig();
		const { blinkMinInterval, blinkMaxInterval } = config.animation;

		this.blinkTimer += delta;
		if (
			this.blinkTimer >
			blinkMinInterval + Math.random() * (blinkMaxInterval - blinkMinInterval)
		) {
			this.vrm.expressionManager?.setValue("blink", 1);
			setTimeout(() => {
				this.vrm.expressionManager?.setValue("blink", 0);
			}, 100);
			this.blinkTimer = 0;
		}
	}

	setMouthOpen(value: number): void {
		this.vrm.expressionManager?.setValue("aa", value);
	}

	getState(): AnimationState {
		return this.state;
	}
}
