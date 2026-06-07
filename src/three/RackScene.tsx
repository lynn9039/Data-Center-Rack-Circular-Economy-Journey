import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../state/store";
import { RackGltfModel } from "./RackGltfModel";
import { ProceduralRack } from "./ProceduralRack";
import { RACK_GLB_URL } from "./rackModelConfig";
import { SCENE_BG, SCENE_FOG } from "./rackVisualTheme";
import { DefaultCameraRig } from "./DefaultCameraRig";

const YAW_DEG_PER_PX = 0.45;
const PITCH_DEG_PER_PX = 0.35;
const DRAG_THRESHOLD_PX = 4;
const BASE_EXPOSURE = 1.02;

/** Lower exposure when yaw is near 16° (specular faces camera) or pitch is extreme. */
function adaptiveExposure(angleDeg: number, pitchDeg: number): number {
  const toHot = (target: number) => {
    const d = Math.abs(((angleDeg - target + 540) % 360) - 180);
    return d;
  };
  const yawHot = Math.min(toHot(16), toHot(196));
  const yawDip = yawHot < 30 ? 1 - 0.38 * (1 - yawHot / 30) : 1;
  const pitchDip =
    Math.abs(pitchDeg) > 10 ? 1 - 0.15 * Math.min(1, (Math.abs(pitchDeg) - 10) / 30) : 1;
  return BASE_EXPOSURE * yawDip * pitchDip;
}

function RackDragRotate() {
  const { gl } = useThree();
  const applyRotationDelta = useAppStore((s) => s.applyRotationDelta);
  const applyPitchDelta = useAppStore((s) => s.applyPitchDelta);
  const setRackDragMoved = useAppStore((s) => s.setRackDragMoved);

  useEffect(() => {
    const el = gl.domElement;
    const drag = { active: false, lastX: 0, lastY: 0, moved: false };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      setRackDragMoved(false);
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;

      if (!drag.moved && (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX)) {
        drag.moved = true;
        setRackDragMoved(true);
      }

      if (drag.moved) {
        if (dx !== 0) applyRotationDelta(dx * YAW_DEG_PER_PX);
        if (dy !== 0) applyPitchDelta(-dy * PITCH_DEG_PER_PX);
      }

      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
    };

    const endDrag = (e: PointerEvent) => {
      if (!drag.active) return;
      drag.active = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, [gl, applyRotationDelta, applyPitchDelta, setRackDragMoved]);

  return null;
}

function AdaptiveExposure() {
  const rotation = useAppStore((s) => s.rotation);
  const { gl } = useThree();
  useFrame(() => {
    gl.toneMappingExposure = adaptiveExposure(rotation.angleDeg, rotation.pitchDeg);
  });
  return null;
}

function RackModelSwitch({
  angleDeg,
  pitchDeg,
  useGltf,
}: {
  angleDeg: number;
  pitchDeg: number;
  useGltf: boolean;
}) {
  if (useGltf) {
    return (
      <Suspense fallback={<ProceduralRack angleDeg={angleDeg} pitchDeg={pitchDeg} />}>
        <RackGltfModel angleDeg={angleDeg} pitchDeg={pitchDeg} />
      </Suspense>
    );
  }
  return <ProceduralRack angleDeg={angleDeg} pitchDeg={pitchDeg} />;
}

function SceneContent({
  onReady,
  useGltf,
}: {
  onReady: () => void;
  useGltf: boolean;
}) {
  const rotation = useAppStore((s) => s.rotation);
  const { gl } = useThree();
  const ready = useRef(false);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      gl.domElement.style.cursor = "grab";
      requestAnimationFrame(() => {
        gl.domElement.style.pointerEvents = "auto";
        onReady();
      });
    }
  }, [gl, onReady]);

  return (
    <>
      <color attach="background" args={[SCENE_BG]} />
      <fog attach="fog" args={[SCENE_FOG, 12, 28]} />
      <Environment preset="warehouse" environmentIntensity={0.38} />
      <ambientLight intensity={0.48} />
      <hemisphereLight args={["#b8c8d8", "#6b8498", 0.55]} />
      <directionalLight position={[0, 4, 2]} intensity={0.35} color="#c8d8e8" />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={15}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight position={[-5, 3, -2]} intensity={0.32} color="#8aa8c0" />
      <pointLight position={[0, 1.5, 2.2]} intensity={0.12} color="#3d9eff" distance={6} />
      <ContactShadows position={[0, -0.61, 0]} opacity={0.06} blur={3.5} scale={5} far={1.2} color="#6b8498" />
      <DefaultCameraRig />
      <RackDragRotate />
      <AdaptiveExposure />
      <RackModelSwitch
        angleDeg={rotation.angleDeg}
        pitchDeg={rotation.pitchDeg}
        useGltf={useGltf}
      />
    </>
  );
}

export function RackScene({ onReady }: { onReady: () => void }) {
  const clearSelection = useAppStore((s) => s.clearSelection);
  const detailOpen = useAppStore((s) => s.detailOpen);
  const consumeRackDrag = useAppStore((s) => s.consumeRackDrag);
  const [useGltf, setUseGltf] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(RACK_GLB_URL, { method: "HEAD" })
      .then((r) => setUseGltf(r.ok))
      .catch(() => setUseGltf(false));
  }, []);

  return (
    <div className="rack-canvas-wrap">
      <Canvas
        camera={{ fov: 42, near: 0.1, far: 50 }}
        dpr={[1, 2]}
        shadows
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: BASE_EXPOSURE,
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        style={{ width: "100%", height: "100%", background: SCENE_BG }}
        onPointerMissed={() => {
          if (consumeRackDrag()) return;
          if (!detailOpen) clearSelection();
        }}
      >
        {useGltf !== null && <SceneContent onReady={onReady} useGltf={useGltf} />}
      </Canvas>
    </div>
  );
}
