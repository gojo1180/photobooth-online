'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotionPreference } from './useReducedMotionPreference';
import { Camera, Pause, Play, Sparkles } from 'lucide-react';
import styles from './PhotoboothScene.module.css';

export function PhotoboothScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const visible = useInView(sceneRef, { margin: '80px' });
  const reducedMotion = useReducedMotionPreference();
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [shots, setShots] = useState(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 90, damping: 22 });
  const rotateY = useSpring(tiltY, { stiffness: 90, damping: 22 });
  const active = visible && pageVisible && !paused && !reducedMotion;

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  function moveScene(event: PointerEvent<HTMLDivElement>) {
    if (!active || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    tiltX.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 10);
    tiltY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 14);
  }

  function resetTilt() {
    tiltX.set(0);
    tiltY.set(0);
  }

  return (
    <div ref={sceneRef} className={styles.scene} data-active={active} data-still={Boolean(reducedMotion || paused)}>
      <div className={styles.stage} onPointerMove={moveScene} onPointerLeave={resetTilt}>
        <div className={styles.halo} aria-hidden="true" />
        <div className={styles.orbit} aria-hidden="true" />
        <span className={styles.edition} aria-hidden="true">THE EVERYDAY MEMORY MAKER</span>
        <div className={styles.shadow} aria-hidden="true" />

        <motion.div className={styles.world} style={{ rotateX: active ? rotateX : 0, rotateY: active ? rotateY : 0 }}>
          <div className={styles.floating}>
            <div className={styles.camera}>
              <div className={styles.cameraSide} aria-hidden="true" />
              <div className={styles.cameraTop} aria-hidden="true" />
              <div className={styles.cameraFront}>
                <div className={styles.brand} aria-hidden="true"><span>scribblepie</span><small>SNAPBOOTH / 01</small></div>
                <div className={styles.viewfinder} aria-hidden="true"><i /></div>
                <div className={styles.flash} aria-hidden="true" />
                <div className={styles.cameraBand} aria-hidden="true" />
                <div className={styles.lens} aria-hidden="true"><div className={styles.lensRing}><div className={styles.glass}><i /></div></div></div>
                <span className={styles.lensLabel} aria-hidden="true">GOOD TIMES • IN FOCUS</span>
                <button
                  type="button"
                  className={styles.shutter}
                  onClick={() => setShots((count) => count + 1)}
                  aria-label="Try the demo shutter. No camera access needed."
                ><Camera size={18} aria-hidden="true" /></button>
                <span className={styles.shutterLabel} aria-hidden="true">PRESS ME</span>
                <span className={styles.cameraFoot} aria-hidden="true">A LITTLE RETRO. A LOT OF YOU.</span>
              </div>
            </div>
          </div>

          <div className={styles.strip} key={shots} data-printed={shots > 0} aria-hidden="true">
            <span className={styles.stripTitle}>TODAY LOOKS GOOD ON YOU</span>
            {[0, 1, 2].map((pose) => (
              <div key={pose} className={styles.photo} data-pose={(pose + shots) % 3}>
                <span className={styles.photoSun} />
                <span className={styles.portrait}><i /><b /></span>
                <span className={styles.photoStar}>✦</span>
                <small>0{pose + 1}</small>
              </div>
            ))}
            <span className={styles.stripFooter}>scribblepie <span>♡</span></span>
          </div>
          <div className={styles.postcard} aria-hidden="true"><span>made for<br /><em>memories.</em></span><Sparkles size={28} /></div>
          <span className={styles.sparkle} aria-hidden="true">✦</span>
          <span className={styles.sparkleSmall} aria-hidden="true">✧</span>
        </motion.div>
      </div>

      <div className={styles.controls}>
        <span className={styles.hint}><Sparkles size={14} aria-hidden="true" /> Try the shutter. Keep the feeling.</span>
        <button type="button" className={styles.pause} disabled={Boolean(reducedMotion)} aria-pressed={paused || Boolean(reducedMotion)}
          aria-label={reducedMotion ? 'Animations off: reduced motion enabled' : paused ? 'Resume scene animation' : 'Pause scene animation'}
          onClick={() => { resetTilt(); setPaused((value) => !value); }}>
          {paused || reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          <span>{reducedMotion ? 'Motion off' : paused ? 'Play' : 'Pause'}</span>
        </button>
      </div>
      <span className="sr-only" role="status">{shots > 0 ? `Demo photostrip ${shots} created. Start a Solo session to take your own photos.` : ''}</span>
    </div>
  );
}
