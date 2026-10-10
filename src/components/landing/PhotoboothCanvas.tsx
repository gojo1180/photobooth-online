'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrthographicCamera, PerformanceMonitor, useGLTF } from '@react-three/drei';
import { DoubleSide, MathUtils, type Group, type Mesh, type MeshBasicMaterial, type MeshStandardMaterial, type PointLight } from 'three';
import { makeSceneTexture } from './sceneTextures';

export interface PhotoboothCanvasProps {
  running: boolean;
  still: boolean;
  shots: number;
  duo: boolean;
  pointer: RefObject<ScenePointer>;
  onReady: () => void;
  onFailure: () => void;
  onCapture: () => void;
  onComplete: () => void;
}

export interface ScenePointer {
  x: number;
  y: number;
  scroll: number;
  dragX: number;
  dragY: number;
  dragging: boolean;
  moved: number;
}

interface SceneProps extends PhotoboothCanvasProps {
  onHover: (hovered: boolean) => void;
}

const ease = (t: number) => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3);
const SPRING_K = 32;
const SPRING_DAMP = 5.6;
const MAX_SPIN_VELOCITY = 10;
const SPIN_LIMIT = { x: 0.6, y: 1.4 };
const CLICK_TOLERANCE = 5;

/** 3D Polaroid Camera Model loaded from GLB */
function PolaroidModel({
  onShoot,
  onHover,
}: {
  onShoot: (event: { stopPropagation: () => void }) => void;
  onHover: (hovered: boolean) => void;
}) {
  const { scene } = useGLTF('/models/polaroid_camera.glb');

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as MeshStandardMaterial;
        if (mat) {
          if (mat.emissive) mat.emissive.set(0x000000);
          mat.roughness = Math.min(0.65, mat.roughness || 0.45);
          mat.metalness = Math.max(0.12, mat.metalness || 0.2);
          mat.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);

  return (
    <group
      onClick={onShoot}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      {/* Scaled up (0.39) to make the camera heroic and prominent */}
      <group scale={[0.39, 0.39, 0.39]} rotation={[0, Math.PI, 0]}>
        <primitive object={cloned} position={[-0.125, -0.345, 4.969]} />
      </group>
    </group>
  );
}

function Scene({ running, still, shots, duo, pointer, onReady, onFailure, onCapture, onComplete, onHover }: SceneProps) {
  const { size, gl, invalidate, setDpr } = useThree();
  const world = useRef<Group>(null);
  const body = useRef<Group>(null);
  const strip = useRef<Group>(null);
  const twin = useRef<Group>(null);
  const flash = useRef<MeshStandardMaterial>(null);
  const flashLight = useRef<PointLight>(null);
  const clock = useRef(0);
  const progress = useRef(2);
  const pendingShot = useRef(false);
  const rendered = useRef(false);
  const smoothScroll = useRef(0);
  const scrollVelocity = useRef(0);
  const shadow = useRef<Mesh>(null);
  const shadowMaterial = useRef<MeshBasicMaterial>(null);
  const spin = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const lastDrag = useRef({ x: 0, y: 0 });

  const stripTextures = useMemo(() => ({
    strip: makeSceneTexture('strip', shots % 3),
    twin: makeSceneTexture('strip', (shots + 1) % 3),
  }), [shots]);

  useEffect(() => () => {
    stripTextures.strip.dispose();
    stripTextures.twin.dispose();
  }, [stripTextures]);

  const shoot = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (pointer.current.moved > CLICK_TOLERANCE) return;
    onCapture();
  };
  const hover = onHover;

  useEffect(() => {
    setDpr(size.width < 500 ? 1 : Math.min(window.devicePixelRatio, 1.5));
    invalidate();
  }, [size.width, setDpr, invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onFailure]);

  useEffect(() => {
    if (!shots) return;
    progress.current = 0;
    pendingShot.current = true;
    invalidate();
  }, [shots, invalidate]);

  useEffect(() => { invalidate(); }, [still, running, duo, invalidate]);

  useFrame((_, delta) => {
    if (!body.current || !strip.current || !twin.current || !world.current) return;
    const dt = Math.min(delta, 0.04);
    if (running) clock.current += dt;
    if (pendingShot.current) {
      progress.current = still ? 2 : progress.current + (running ? dt : 0);
      if (progress.current >= 1.65) {
        pendingShot.current = false;
        onComplete();
      }
    }
    const t = clock.current;
    const p = progress.current;
    const motion = !still;

    // Scroll choreography
    const targetScroll = motion ? pointer.current.scroll : 0;
    const previousScroll = smoothScroll.current;
    smoothScroll.current = MathUtils.damp(previousScroll, targetScroll, 3.5, dt);
    scrollVelocity.current = MathUtils.damp(scrollVelocity.current, (targetScroll - smoothScroll.current) * 3, 6, dt);
    const scroll = smoothScroll.current;
    const lean = MathUtils.clamp(scrollVelocity.current, -0.3, 0.3);

    // Mechanical camera recoil and shake
    const shake = motion && p < 0.28 ? Math.sin(p * 100) * 0.03 * (1 - p / 0.28) : 0;
    const recoilZ = motion && p < 0.22 ? -Math.sin(p / 0.22 * Math.PI) * 0.12 : 0;

    world.current.scale.setScalar(1 - scroll * 0.15);
    world.current.position.set(-scroll * 0.25, scroll * 0.45, -scroll * 0.35);

    // Drag-to-spin with spring physics
    const ptr = pointer.current;
    const s = spin.current;
    const dragDX = ptr.dragX - lastDrag.current.x;
    const dragDY = ptr.dragY - lastDrag.current.y;
    lastDrag.current.x = ptr.dragX;
    lastDrag.current.y = ptr.dragY;
    if (!motion) {
      s.x = 0; s.y = 0; s.vx = 0; s.vy = 0;
    } else if (ptr.dragging) {
      s.y += dragDX;
      s.x += dragDY;
      s.vy = MathUtils.damp(s.vy, dragDX / Math.max(dt, 0.001), 14, dt);
      s.vx = MathUtils.damp(s.vx, dragDY / Math.max(dt, 0.001), 14, dt);
    } else {
      s.vy += (-SPRING_K * s.y - SPRING_DAMP * s.vy) * dt;
      s.vx += (-SPRING_K * s.x - SPRING_DAMP * s.vx) * dt;
      s.y += s.vy * dt;
      s.x += s.vx * dt;
    }
    s.vy = MathUtils.clamp(s.vy, -MAX_SPIN_VELOCITY, MAX_SPIN_VELOCITY);
    s.vx = MathUtils.clamp(s.vx, -MAX_SPIN_VELOCITY, MAX_SPIN_VELOCITY);
    if (Math.abs(s.y) >= SPIN_LIMIT.y && Math.sign(s.vy) === Math.sign(s.y)) s.vy = 0;
    if (Math.abs(s.x) >= SPIN_LIMIT.x && Math.sign(s.vx) === Math.sign(s.x)) s.vx = 0;
    s.y = MathUtils.clamp(s.y, -SPIN_LIMIT.y, SPIN_LIMIT.y);
    s.x = MathUtils.clamp(s.x, -SPIN_LIMIT.x, SPIN_LIMIT.x);
    world.current.rotation.set(s.x, s.y, 0);

    // Floating levitation + pointer parallax
    const baseY = 0.08 + (motion ? Math.sin(t * 0.85) * 0.055 : 0);
    body.current.position.set(-0.22 + shake, baseY, recoilZ);
    body.current.rotation.x = MathUtils.damp(body.current.rotation.x, 0.05 + (motion ? -pointer.current.y * 0.16 + scroll * 0.22 + lean * 0.4 : 0), 5, dt);
    body.current.rotation.y = MathUtils.damp(body.current.rotation.y, (duo ? -0.06 : -0.16) + (motion ? pointer.current.x * 0.32 + Math.sin(t * 0.45) * 0.02 + scroll * 0.8 : 0), 5, dt);
    body.current.rotation.z = -0.04 + shake + (motion ? -scroll * 0.1 + lean * 0.25 : 0);
    if (still) body.current.rotation.set(0.05, duo ? -0.06 : -0.16, -0.04);

    // Shutter flash explosion
    const glow = motion && p > 0.07 && p < 0.24 ? Math.sin((p - 0.07) / 0.17 * Math.PI) : 0;
    if (flash.current) flash.current.emissiveIntensity = 0.1 + glow * 5.5;
    if (flashLight.current) flashLight.current.intensity = glow * 5.0;

    // Authentic Polaroid Film Ejection from the front tray mouth (Z = 1.86, Y = -1.22)
    for (let index = 0; index < 2; index++) {
      const item = index === 0 ? strip.current : twin.current;
      item.visible = index === 0 || duo;

      // Slot mouth coordinates (located at the front lip of the Polaroid tray)
      const slotX = -0.17 + index * 0.12;
      const slotY = -1.22;
      const slotZ = 1.86 + index * 0.03;

      // Target showcase coordinates (top edge of the floating photo print)
      const finalX = index === 0 ? 1.62 : 0.96;
      const finalY = index === 0 ? 0.90 : 0.45;
      const finalZ = 1.15;

      if (p < 0.85 && motion) {
        // Phase 1: Feeding out forward-downwards from the camera mouth
        const eject = ease((p - 0.2) / 0.65);
        item.scale.set(1.05, Math.max(0.015, eject * 1.05), 1.05);
        item.position.set(slotX, slotY, slotZ);
        // Tilted forward as it emerges out of the slot
        item.rotation.set(0.38, -0.15, -0.04);
      } else {
        // Phase 2: Detaching from the camera and smoothly floating into showcase position
        const settle = motion ? ease((p - 0.85) / 0.8) : 1;
        item.scale.setScalar(1.05);
        item.position.set(
          MathUtils.lerp(slotX, finalX, settle),
          MathUtils.lerp(slotY, finalY, settle) + (motion ? Math.sin(t + index) * 0.04 * settle : 0),
          MathUtils.lerp(slotZ, finalZ, settle)
        );
        item.rotation.set(
          MathUtils.lerp(0.38, 0, settle),
          MathUtils.lerp(-0.15, -0.07, settle),
          MathUtils.lerp(-0.04, index === 0 ? -0.14 : 0.12, settle)
        );
      }
    }

    // Ground contact shadow under the enlarged camera
    if (shadow.current && shadowMaterial.current) {
      const lift = motion ? Math.sin(t * 0.85) : 0;
      shadow.current.scale.set(2.5 * (1 - lift * 0.04 - Math.abs(s.y) * 0.1), 0.34 * (1 - lift * 0.04), 1);
      shadowMaterial.current.opacity = 0.16 - lift * 0.02;
    }

    if (!rendered.current) {
      rendered.current = true;
      onReady();
    }
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={Math.min(size.width / 5.4, size.height / 4.4)}
        near={0.1}
        far={40}
      />
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(size.width < 500 ? 1 : Math.min(window.devicePixelRatio, 1.5))}
      />

      {/* Balanced Studio Lighting */}
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#fff3dc', '#6b658a', 1.4]} />
      <directionalLight position={[-3, 5, 6]} intensity={3.2} color="#fff2db" />
      <directionalLight position={[4, 2, 3]} intensity={1.5} color="#cfddff" />
      <directionalLight position={[-3, 2, -4]} intensity={2.0} color="#ffb566" />

      <Environment resolution={128} frames={1} environmentIntensity={1.0}>
        <Lightformer form="rect" intensity={3} color="#fff4e0" position={[-4, 4, 5]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#cfe0ff" position={[5, 1, 3]} scale={[3, 5, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffc98a" position={[0, 1, -5]} scale={4} />
      </Environment>

      <group ref={world}>
        {/* Soft, Realistic Contact Shadow */}
        <mesh ref={shadow} position={[-0.22, -1.62, -0.4]} scale={[2.5, 0.34, 1]}>
          <circleGeometry args={[1, 48]} />
          <meshBasicMaterial ref={shadowMaterial} color="#5e3800" transparent opacity={0.16} depthWrite={false} />
        </mesh>

        {/* 3D Camera Body (Enlarged & Centered GLB Model) */}
        <group ref={body} position={[-0.22, 0.08, 0]} rotation={[0.05, -0.16, -0.04]}>
          <PolaroidModel onShoot={shoot} onHover={hover} />

          {/* Flash Unit Light & Bulb Glow Mesh */}
          <pointLight ref={flashLight} position={[0.38, 1.30, 0.95]} color="#fff5e6" intensity={0} distance={6} />
          <mesh position={[0.38, 1.30, 0.88]}>
            <planeGeometry args={[0.38, 0.24]} />
            <meshStandardMaterial ref={flash} color="#f4eee3" emissive="#ffddb0" emissiveIntensity={0.1} roughness={0.3} />
          </mesh>
        </group>

        {/* Dynamic Physical Photo Strips (Top-Edge Pivot for Authentic Slot Ejection) */}
        <group ref={twin} visible={duo}>
          <group position={[0, -0.95, 0]}>
            <mesh>
              <boxGeometry args={[0.76, 1.9, 0.024]} />
              <meshStandardMaterial color="#ffebc6" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.015]}>
              <planeGeometry args={[0.76, 1.9]} />
              <meshBasicMaterial map={stripTextures.twin} side={DoubleSide} toneMapped={false} />
            </mesh>
          </group>
        </group>

        <group ref={strip}>
          <group position={[0, -0.95, 0]}>
            <mesh>
              <boxGeometry args={[0.76, 1.9, 0.024]} />
              <meshStandardMaterial color="#ffe2ee" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.015]}>
              <planeGeometry args={[0.76, 1.9]} />
              <meshBasicMaterial map={stripTextures.strip} side={DoubleSide} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

export default function PhotoboothCanvas(props: PhotoboothCanvasProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 85, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      frameloop={props.running ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={hovered ? { cursor: 'pointer' } : undefined}
      fallback={<span>3D preview unavailable.</span>}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Scene {...props} onHover={setHovered} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload('/models/polaroid_camera.glb');
