'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useInView } from 'framer-motion';
import { PhotoboothScene } from './PhotoboothScene';
import type { ScenePointer } from './PhotoboothCanvas';
import styles from './PhotoboothHero.module.css';

const PhotoboothCanvas = dynamic(() => import('./PhotoboothCanvas'), { ssr: false });

// Must match CLICK_TOLERANCE in PhotoboothCanvas so a press is either a drag or a click, never both.
const DRAG_THRESHOLD = 5;

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function PhotoboothHero({ duoPreview = false }: { duoPreview?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { margin: '80px' });
  const pointer = useRef<ScenePointer>({ x: 0, y: 0, scroll: 0, dragX: 0, dragY: 0, dragging: false, moved: 0 });
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  const busyRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [shots, setShots] = useState(0);
  const show3D = ready && !failed;
  const running = inView && pageVisible;

  useEffect(() => {
    if (!inView || enabled || failed) return;
    const id = requestAnimationFrame(() => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (connection?.saveData) return;
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) { setUnavailable(true); return; }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setEnabled(true);
    });
    return () => cancelAnimationFrame(id);
  }, [inView, enabled, failed]);

  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden);
    const scroll = () => {
      if (!root.current) return;
      const bounds = root.current.getBoundingClientRect();
      const start = window.innerHeight * 0.25;
      pointer.current.scroll = Math.max(0, Math.min(1, (start - bounds.top) / (start + bounds.height)));
    };
    scroll();
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
    };
  }, []);

  const capture = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    setShots((value) => value + 1);
  }, []);
  const complete = useCallback(() => { busyRef.current = false; }, []);
  const loaded = useCallback(() => setReady(true), []);
  const failure = useCallback(() => { setFailed(true); busyRef.current = false; }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' || !running) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointer.current.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const press = pressRef.current;
    if (!press) return;
    pointer.current.moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    // Capture only once the press becomes a real drag. Capturing on pointerdown would
    // retarget pointerup to this div and swallow clicks on the 3D shutter.
    if (!pointer.current.dragging && pointer.current.moved > DRAG_THRESHOLD) {
      event.currentTarget.setPointerCapture(event.pointerId);
      pointer.current.dragging = true;
    }
    if (pointer.current.dragging) {
      pointer.current.dragX += event.movementX * 0.012;
      pointer.current.dragY += event.movementY * 0.008;
    }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' || event.button !== 0 || !running) return;
    pressRef.current = { x: event.clientX, y: event.clientY };
    pointer.current.moved = 0;
  }

  function endDrag() {
    pressRef.current = null;
    pointer.current.dragging = false;
    // `moved` is intentionally kept until the next press so the click handler
    // that fires right after pointerup can tell a drag from a tap.
  }

  return (
    <div ref={root} className={styles.root} data-renderer={show3D ? 'three' : 'css'} data-webgl-unavailable={unavailable} data-motion={running ? 'running' : 'stopped'}>
      {!show3D && <PhotoboothScene />}
      {(unavailable || failed) && <p className={styles.caption}>Lightweight preview shown. Try another browser for the full 3D experience.</p>}
      {enabled && !failed && (
        <div className={styles.experience} data-ready={show3D} aria-hidden={!show3D} inert={!show3D}>
          <div className={styles.stage} onPointerMove={move} onPointerDown={startDrag} onPointerUp={endDrag}
            onPointerCancel={endDrag} onLostPointerCapture={endDrag}
            onPointerLeave={() => { pointer.current.x = 0; pointer.current.y = 0; }}>
            <div className={styles.halo} aria-hidden="true" />
            <span className={styles.edition}>THE EVERYDAY MEMORY MAKER</span>
            <SceneBoundary onFailure={failure}>
              <PhotoboothCanvas running={running} still={false} shots={shots} duo={duoPreview}
                pointer={pointer} onReady={loaded} onFailure={failure} onCapture={capture} onComplete={complete} />
            </SceneBoundary>
          </div>
        </div>
      )}
    </div>
  );
}
