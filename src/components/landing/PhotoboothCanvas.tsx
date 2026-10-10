'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, RoundedBox } from '@react-three/drei';
import { DoubleSide, MathUtils, type Group, type Mesh, type MeshStandardMaterial, type PointLight } from 'three';
import { makeSceneTexture } from './sceneTextures';

export interface PhotoboothCanvasProps {
  running: boolean;
  still: boolean;
  shots: number;
  duo: boolean;
  pointer: RefObject<{ x: number; y: number; scroll: number }>;
  onReady: () => void;
  onFailure: () => void;
  onCapture: () => void;
  onComplete: () => void;
}

const ease = (t: number) => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3);

function Scene({ running, still, shots, duo, pointer, onReady, onFailure, onCapture, onComplete }: PhotoboothCanvasProps) {
  const { size, gl, invalidate, setDpr } = useThree();
  const world = useRef<Group>(null);
  const body = useRef<Group>(null);
  const shutter = useRef<Group>(null);
  const lens = useRef<Group>(null);
  const strip = useRef<Group>(null);
  const twin = useRef<Group>(null);
  const postcard = useRef<Group>(null);
  const flash = useRef<MeshStandardMaterial>(null);
  const flashLight = useRef<PointLight>(null);
  const sparkle = useRef<Mesh>(null);
  const clock = useRef(0);
  const progress = useRef(2);
  const pendingShot = useRef(false);
  const rendered = useRef(false);
  const textures = useMemo(() => ({
    brand: makeSceneTexture('brand'), postcard: makeSceneTexture('postcard'),
    strip: makeSceneTexture('strip', shots % 3), twin: makeSceneTexture('strip', (shots + 1) % 3),
  }), [shots]);

  useEffect(() => () => Object.values(textures).forEach((texture) => texture.dispose()), [textures]);

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
    const dt = Math.min(delta, .04);
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
    const scroll = motion ? pointer.current.scroll : 0;
    const shake = motion && p < .28 ? Math.sin(p * 100) * .025 * (1 - p / .28) : 0;
    world.current.scale.setScalar(1 - scroll * .12);
    world.current.position.y = scroll * .2;
    body.current.position.set(-.38 + shake, .15 + (motion ? Math.sin(t * .85) * .065 : 0), 0);
    body.current.rotation.x = MathUtils.damp(body.current.rotation.x, .07 + (motion ? -pointer.current.y * .18 : 0), 5, dt);
    body.current.rotation.y = MathUtils.damp(body.current.rotation.y, (duo ? -.08 : -.24) + (motion ? pointer.current.x * .38 + Math.sin(t * .45) * .025 : 0), 5, dt);
    body.current.rotation.z = -.09 + shake;
    if (still) body.current.rotation.set(.07, duo ? -.08 : -.24, -.09);
    if (shutter.current) shutter.current.position.y = p < .18 && motion ? -.07 * Math.sin(p / .18 * Math.PI) : 0;
    if (lens.current) lens.current.position.z = .015 + (motion && p < .4 ? Math.sin(p / .4 * Math.PI) * .04 : 0);
    // A single, localized warm flash. No full-screen flashing or repeated pulses.
    const glow = motion && p > .1 && p < .23 ? Math.sin((p - .1) / .13 * Math.PI) : 0;
    if (flash.current) flash.current.emissiveIntensity = .1 + glow * 2;
    if (flashLight.current) flashLight.current.intensity = glow * 2;

    for (const [index, item] of [strip.current, twin.current].entries()) {
      item.visible = index === 0 || duo;
      const finalX = index === 0 ? 1.92 : 1.04;
      const finalY = index === 0 ? -.05 : -.46;
      if (p < .85 && motion) {
        const eject = ease((p - .2) / .65);
        item.scale.set(1, Math.max(.015, eject), 1);
        item.position.set(-.25 + index * .1, -.58 - .88 * eject, .66 + index * .02);
        item.rotation.set(0, 0, -.09);
      } else {
        const settle = motion ? ease((p - .85) / .8) : 1;
        item.scale.setScalar(1);
        item.position.set(MathUtils.lerp(-.25, finalX, settle), MathUtils.lerp(-1.46, finalY, settle) + (motion ? Math.sin(t + index) * .045 * settle : 0), .68 + index * .03);
        item.rotation.set(0, -.08, MathUtils.lerp(-.09, index === 0 ? -.15 : .15, settle));
      }
    }
    if (postcard.current) {
      postcard.current.position.y = -1.23 + (motion ? Math.sin(t * .7 + 2) * .055 : 0);
      postcard.current.rotation.z = .15 + (motion ? Math.sin(t * .5) * .025 : 0);
    }
    if (sparkle.current) sparkle.current.rotation.z = motion ? t * .12 : .2;
    if (!rendered.current) { rendered.current = true; onReady(); }
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={Math.min(size.width / 6.5, size.height / 5.05)} near={.1} far={40} />
      <ambientLight intensity={1.2} />
      <hemisphereLight args={['#fff3dc', '#6b658a', 2]} />
      <directionalLight position={[-3, 5, 6]} intensity={3.2} color="#fff1da" />
      <directionalLight position={[4, 1, 2]} intensity={1.3} color="#cfddff" />
      <group ref={world}>
        <mesh position={[-.4, -1.48, -.9]} scale={[1.8, .19, 1]}>
          <circleGeometry args={[1, 48]} /><meshBasicMaterial color="#895100" transparent opacity={.12} depthWrite={false} />
        </mesh>
        <mesh position={[.1, .15, -.85]} rotation={[.12, .65, -.3]}>
          <torusGeometry args={[2.2, .009, 5, 72]} /><meshBasicMaterial color="#b77b28" transparent opacity={.5} />
        </mesh>

        <group ref={body} position={[-.38, .15, 0]} rotation={[.07, -.24, -.09]}>
          <RoundedBox args={[2.85, 1.92, .76]} radius={.2} smoothness={3}>
            <meshPhysicalMaterial color="#f6eddb" roughness={.42} clearcoat={.35} />
          </RoundedBox>
          <RoundedBox args={[2.8, 1.03, .78]} radius={.09} smoothness={2} position={[0, -.22, .015]}>
            <meshPhysicalMaterial color="#1230b0" roughness={.46} clearcoat={.3} />
          </RoundedBox>
          <mesh position={[-.59, .62, .395]}>
            <planeGeometry args={[1.24, .46]} /><meshBasicMaterial map={textures.brand} transparent depthWrite={false} />
          </mesh>
          <RoundedBox args={[.47, .3, .1]} radius={.045} smoothness={2} position={[.94, .63, .42]}>
            <meshStandardMaterial color="#747a80" metalness={.45} roughness={.35} />
          </RoundedBox>
          <RoundedBox args={[.34, .18, .06]} radius={.025} smoothness={2} position={[.94, .63, .49]}>
            <meshPhysicalMaterial color="#284360" metalness={.5} roughness={.14} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[.37, .22, .05]} radius={.025} smoothness={2} position={[.36, .63, .405]}>
            <meshStandardMaterial ref={flash} color="#f4eee3" emissive="#ffddb0" emissiveIntensity={.1} roughness={.3} />
          </RoundedBox>
          <pointLight ref={flashLight} position={[.36, .63, 1]} color="#ffe4bc" intensity={0} distance={4} />
          <group ref={lens}>
            <mesh position={[.17, -.14, .56]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[.68, .7, .36, 48]} /><meshStandardMaterial color="#18243c" roughness={.32} metalness={.4} />
            </mesh>
            <mesh position={[.17, -.14, .76]}>
              <torusGeometry args={[.575, .069, 12, 64]} /><meshStandardMaterial color="#ded5bf" metalness={.65} roughness={.25} />
            </mesh>
            <mesh position={[.17, -.14, .78]}>
              <torusGeometry args={[.46, .045, 10, 48]} /><meshStandardMaterial color="#101b35" metalness={.4} roughness={.25} />
            </mesh>
            <mesh position={[.17, -.14, .795]} scale={[1, 1, .24]}>
              <sphereGeometry args={[.423, 32, 20]} /><meshPhysicalMaterial color="#143f65" metalness={.6} roughness={.12} clearcoat={1} clearcoatRoughness={.08} />
            </mesh>
            <mesh position={[.05, .01, .9]} rotation={[0, 0, -.4]} scale={[1, .4, 1]}>
              <circleGeometry args={[.13, 24]} /><meshBasicMaterial color="#d8f4ff" transparent opacity={.48} depthWrite={false} />
            </mesh>
          </group>
          <group ref={shutter}>
            <mesh position={[-.93, 1, 0]} onClick={(event) => { event.stopPropagation(); onCapture(); }}>
              <cylinderGeometry args={[.19, .22, .17, 24]} /><meshStandardMaterial color="#fea12b" metalness={.25} roughness={.36} />
            </mesh>
          </group>
          <mesh position={[-1.03, -.12, .47]} rotation={[Math.PI / 2, 0, 0]} onClick={(event) => { event.stopPropagation(); onCapture(); }}>
            <cylinderGeometry args={[.17, .18, .1, 24]} /><meshStandardMaterial color="#fea12b" roughness={.35} metalness={.2} />
          </mesh>
          <RoundedBox args={[1.24, .075, .08]} radius={.025} smoothness={2} position={[.05, -.79, .39]}>
            <meshStandardMaterial color="#172137" roughness={.7} />
          </RoundedBox>
        </group>

        <group ref={twin} visible={duo}>
          <mesh><boxGeometry args={[.72, 1.82, .022]} /><meshStandardMaterial color="#ffebc6" /></mesh>
          <mesh position={[0, 0, .014]}><planeGeometry args={[.72, 1.82]} /><meshBasicMaterial map={textures.twin} side={DoubleSide} /></mesh>
        </group>
        <group ref={strip}>
          <mesh><boxGeometry args={[.72, 1.82, .022]} /><meshStandardMaterial color="#ffe2ee" /></mesh>
          <mesh position={[0, 0, .014]}><planeGeometry args={[.72, 1.82]} /><meshBasicMaterial map={textures.strip} side={DoubleSide} /></mesh>
        </group>
        <group ref={postcard} position={[-1.42, -1.23, .85]} rotation={[0, .08, .15]}>
          <mesh><boxGeometry args={[1.55, .59, .025]} /><meshStandardMaterial color="#ffd8ec" /></mesh>
          <mesh position={[0, 0, .016]}><planeGeometry args={[1.55, .59]} /><meshBasicMaterial map={textures.postcard} /></mesh>
        </group>
        <mesh ref={sparkle} position={[1.95, 1.48, .1]} rotation={[0, 0, .2]}>
          <octahedronGeometry args={[.25, 0]} /><meshStandardMaterial color="#001c97" metalness={.2} roughness={.35} />
        </mesh>
        <mesh position={[-2.2, 1.28, .1]} rotation={[.4, .2, .5]}>
          <octahedronGeometry args={[.13, 0]} /><meshStandardMaterial color="#fff4ce" roughness={.4} />
        </mesh>
      </group>
    </>
  );
}

export default function PhotoboothCanvas(props: PhotoboothCanvasProps) {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 75, near: .1, far: 40 }}
      dpr={[1, 1.5]} frameloop={props.running ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      fallback={<span>3D preview unavailable.</span>} aria-hidden="true">
      <Scene {...props} />
    </Canvas>
  );
}
