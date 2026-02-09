// ===================
// © AngelaMos | 2026
// loadMixamoAnimation.ts
// ===================

import type { VRM } from "@pixiv/three-vrm";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { mixamoVRMRigMap } from "./mixamoVRMRigMap";

export async function loadMixamoAnimation(
	url: string,
	vrm: VRM,
): Promise<THREE.AnimationClip> {
	const loader = new FBXLoader();
	const asset = await loader.loadAsync(url);

	const clip = THREE.AnimationClip.findByName(asset.animations, "mixamo.com");
	if (!clip) throw new Error("mixamo.com animation clip not found");

	const tracks: THREE.KeyframeTrack[] = [];

	const restRotationInverse = new THREE.Quaternion();
	const parentRestWorldRotation = new THREE.Quaternion();
	const _quatA = new THREE.Quaternion();

	const motionHipsHeight =
		asset.getObjectByName("mixamorigHips")?.position.y ?? 1;
	const vrmHipsY = vrm.humanoid?.normalizedRestPose?.hips?.position?.[1] ?? 1;
	const hipsPositionScale = vrmHipsY / motionHipsHeight;

	clip.tracks.forEach((track) => {
		const trackSplitted = track.name.split(".");
		const mixamoRigName = trackSplitted[0];
		const vrmBoneName = mixamoVRMRigMap[mixamoRigName];
		const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
		const mixamoRigNode = asset.getObjectByName(mixamoRigName);

		if (vrmNodeName != null && mixamoRigNode != null) {
			const propertyName = trackSplitted[1];

			mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
			mixamoRigNode.parent?.getWorldQuaternion(parentRestWorldRotation);

			if (track instanceof THREE.QuaternionKeyframeTrack) {
				for (let i = 0; i < track.values.length; i += 4) {
					const flatQuaternion = track.values.slice(i, i + 4);

					_quatA.fromArray(flatQuaternion);
					_quatA
						.premultiply(parentRestWorldRotation)
						.multiply(restRotationInverse);
					_quatA.toArray(flatQuaternion);

					flatQuaternion.forEach((v, index) => {
						track.values[index + i] = v;
					});
				}

				tracks.push(
					new THREE.QuaternionKeyframeTrack(
						`${vrmNodeName}.${propertyName}`,
						track.times,
						track.values.map((v, i) =>
							vrm.meta?.metaVersion === "0" && i % 2 === 0 ? -v : v,
						),
					),
				);
			} else if (track instanceof THREE.VectorKeyframeTrack) {
				const value = track.values.map(
					(v, i) =>
						(vrm.meta?.metaVersion === "0" && i % 3 !== 1 ? -v : v) *
						hipsPositionScale,
				);
				tracks.push(
					new THREE.VectorKeyframeTrack(
						`${vrmNodeName}.${propertyName}`,
						track.times,
						value,
					),
				);
			}
		}
	});

	return new THREE.AnimationClip("vrmAnimation", clip.duration, tracks);
}
