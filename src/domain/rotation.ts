export interface RotationState {
  /** Horizontal yaw [0, 360) */
  angleDeg: number;
  /** Vertical tilt [-PITCH_MAX, PITCH_MAX] — drag up/down */
  pitchDeg: number;
}

export const PITCH_MAX_DEG = 40;

export function normalizeAngle(deg: number): number {
  const wrapped = deg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function clampPitch(deg: number): number {
  return Math.max(-PITCH_MAX_DEG, Math.min(PITCH_MAX_DEG, deg));
}

export function applyYawDelta(state: RotationState, deltaDeg: number): RotationState {
  return { ...state, angleDeg: normalizeAngle(state.angleDeg + deltaDeg) };
}

export function applyPitchDelta(state: RotationState, deltaDeg: number): RotationState {
  return { ...state, pitchDeg: clampPitch(state.pitchDeg + deltaDeg) };
}

/** @deprecated use applyYawDelta */
export function applyDelta(state: RotationState, deltaDeg: number): RotationState {
  return applyYawDelta(state, deltaDeg);
}
