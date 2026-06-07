import { useRef, useCallback } from "react";
import { useAppStore } from "../state/store";

export function RotationControl() {
  const applyRotationDelta = useAppStore((s) => s.applyRotationDelta);
  const rotation = useAppStore((s) => s.rotation);
  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const center = useRef({ x: 0, y: 0 });

  const pointerAngle = (clientX: number, clientY: number) => {
    const dx = clientX - center.current.x;
    const dy = clientY - center.current.y;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    dragging.current = true;
    lastAngle.current = pointerAngle(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const a = pointerAngle(e.clientX, e.clientY);
      let delta = a - lastAngle.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      lastAngle.current = a;
      applyRotationDelta(delta);
    },
    [applyRotationDelta],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      className="rotation-wheel"
      role="slider"
      aria-label="Rack rotation control"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(rotation.angleDeg)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        ["--knob-angle" as string]: `${rotation.angleDeg}deg`,
      }}
    >
      <span style={{ fontSize: "0.65rem", color: "var(--fg-muted)", marginTop: "55%", textAlign: "center", lineHeight: 1.3 }}>
        {Math.round(rotation.angleDeg)}&deg;
        <br />
        <span style={{ fontSize: "0.55rem" }}>{Math.round(rotation.pitchDeg)}&deg; tilt</span>
      </span>
      <style>{`
        .rotation-wheel::after {
          transform: rotate(${rotation.angleDeg}deg);
        }
      `}</style>
    </div>
  );
}
