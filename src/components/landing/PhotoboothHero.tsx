'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useInView } from 'framer-motion';
import { PhotoboothScene } from './PhotoboothScene';
import styles from './PhotoboothHero.module.css';

const PhotoboothCanvas = dynamic(() => import('./PhotoboothCanvas'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function PhotoboothHero({ duoPreview = false }: { duoPreview?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { margin: '80px' });
  const pointer = useRef({ x: 0, y: 0, scroll: 0 });
  const busyRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [shots, setShots] = useState(0);
  const [busy, setBusy] = useState(false);
  const [duo, setDuo] = useState(false);
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
      pointer.current.scroll = Math.max(0, Math.min(1, -bounds.top / bounds.height));
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('scroll', scroll);
    };
  }, []);

  const capture = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setShots((value) => value + 1);
  }, []);
  const complete = useCallback(() => { busyRef.current = false; setBusy(false); }, []);
  const loaded = useCallback(() => setReady(true), []);
  const failure = useCallback(() => { setFailed(true); busyRef.current = false; setBusy(false); }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !running) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointer.current.y = (event.clientY - bounds.top) / bounds.height - 0.5;
  }

  return (
    <div ref={root} className={styles.root} data-renderer={show3D ? 'three' : 'css'} data-webgl-unavailable={unavailable} data-motion={running ? 'running' : 'stopped'}>
      {!show3D && <PhotoboothScene />}
      {(unavailable || failed) && <p className={styles.caption}>Lightweight preview shown. Try another browser for the full 3D experience.</p>}
      {enabled && !failed && (
        <div className={styles.experience} data-ready={show3D} aria-hidden={!show3D} inert={!show3D}>
          <div className={styles.stage} onPointerMove={move} onPointerLeave={() => { pointer.current.x = 0; pointer.current.y = 0; }}>
            <div className={styles.halo} aria-hidden="true" />
            <span className={styles.edition}>THE EVERYDAY MEMORY MAKER</span>
            <SceneBoundary onFailure={failure}>
              <PhotoboothCanvas running={running} still={false} shots={shots} duo={duo || duoPreview}
                pointer={pointer} onReady={loaded} onFailure={failure} onCapture={capture} onComplete={complete} />
            </SceneBoundary>
          </div>
        </div>
      )}
    </div>
  );
}
