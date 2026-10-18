'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useInView } from 'framer-motion';
import type { ScenePointer } from './PhotoboothCanvas';
import styles from './PhotoboothHero.module.css';

const PhotoboothCanvas = dynamic(() => import('./PhotoboothCanvas'), { ssr: false });

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
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [shots, setShots] = useState(0);
  const running = inView && pageVisible;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const complete = useCallback(() => {
    busyRef.current = false;
  }, []);

  const loaded = useCallback(() => {}, []);

  const failure = useCallback(() => {
    setFailed(true);
    busyRef.current = false;
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' || !running) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointer.current.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const press = pressRef.current;
    if (!press) return;
    pointer.current.moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
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
  }

  return (
    <div ref={root} className={styles.root} data-motion={running ? 'running' : 'stopped'}>
      <div
        className={styles.stage}
        onPointerMove={move}
        onPointerDown={startDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onPointerLeave={() => { pointer.current.x = 0; pointer.current.y = 0; }}
      >
        <div className={styles.halo} aria-hidden="true" />
        <span className={styles.edition}>THE EVERYDAY MEMORY MAKER</span>

        {mounted && !failed && (
          <SceneBoundary onFailure={failure}>
            <PhotoboothCanvas
              running={running}
              still={false}
              shots={shots}
              duo={duoPreview}
              pointer={pointer}
              onReady={loaded}
              onFailure={failure}
              onCapture={capture}
              onComplete={complete}
            />
          </SceneBoundary>
        )}

        {failed && (
          <p className={styles.caption}>
            WebGL preview unavailable. Please check your browser hardware acceleration.
          </p>
        )}
      </div>
    </div>
  );
}
