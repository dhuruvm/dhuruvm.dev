import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import PhaserGame from '@/game/PhaserGame';
import type { GameStats } from '@/game/GameScene';

const mono = "'Space Mono', monospace";
const sans = "'Inter', sans-serif";

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${(s % 60).toString().padStart(2, '0')}s` : `${s}s`;
}

export default function Game() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [booted, setBooted] = useState(false);
  const [overlayScope, animateOverlay] = useAnimate();

  const [tLeft,  setTLeft]  = useState(false);
  const [tRight, setTRight] = useState(false);
  const [tJump,  setTJump]  = useState(false);

  // Collapse circle overlay on mount
  useEffect(() => {
    animateOverlay(
      overlayScope.current,
      { clipPath: 'circle(0% at 50% 50%)' },
      { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance boot screen after 2s (circle takes 0.55s, leaving ~1.45s of boot visibility)
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const resetAll = useCallback(() => {
    setTLeft(false);
    setTRight(false);
    setTJump(false);
  }, []);

  const stopLeft  = useCallback(() => setTLeft(false),  []);
  const stopRight = useCallback(() => setTRight(false), []);
  const stopJump  = useCallback(() => setTJump(false),  []);

  const goBack = useCallback(async () => {
    resetAll();
    await animateOverlay(
      overlayScope.current,
      { clipPath: 'circle(150% at 50% 50%)' },
      { duration: 0.45, ease: [0.76, 0, 0.24, 1] },
    );
    navigate('/');
  }, [animateOverlay, overlayScope, navigate, resetAll]);

  const goProjects = useCallback(async () => {
    resetAll();
    await animateOverlay(
      overlayScope.current,
      { clipPath: 'circle(150% at 50% 50%)' },
      { duration: 0.45, ease: [0.76, 0, 0.24, 1] },
    );
    navigate('/projects');
  }, [animateOverlay, overlayScope, navigate, resetAll]);

  const handleComplete = useCallback((s: GameStats) => setStats(s), []);

  useEffect(() => {
    window.addEventListener('blur',            resetAll);
    window.addEventListener('visibilitychange', resetAll);
    return () => {
      window.removeEventListener('blur',             resetAll);
      window.removeEventListener('visibilitychange', resetAll);
    };
  }, [resetAll]);

  return (
    <div
      className="fixed inset-0 bg-white overflow-hidden"
      style={{ fontFamily: sans, touchAction: 'none' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;700;900&display=swap');
        * { -webkit-tap-highlight-color: transparent; user-select: none; }
      `}</style>

      {/* Black circle overlay */}
      <div
        ref={overlayScope}
        className="fixed inset-0 bg-black z-[9999] pointer-events-none"
        style={{ clipPath: 'circle(150% at 50% 50%)' }}
      />

      {/* ── BOOT SCREEN ──────────────────────────────────────────── */}
      <AnimatePresence>
        {!booted && !stats && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03, filter: 'blur(4px)' }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center cursor-pointer select-none"
            onClick={() => setBooted(true)}
          >
            {/* Top label */}
            <div style={{
              fontFamily: mono,
              fontSize: '8px',
              letterSpacing: '0.38em',
              color: 'rgba(0,0,0,0.22)',
              marginBottom: 28,
              textTransform: 'uppercase',
            }}>
              PORTFOLIO · INTERACTIVE
            </div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: sans,
                fontWeight: 900,
                fontSize: 'clamp(2.8rem, 11vw, 6.5rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: '#111',
              }}
            >
              DHURUV M
            </motion.h1>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              style={{
                fontFamily: mono,
                fontSize: '11px',
                letterSpacing: '0.32em',
                color: 'rgba(0,0,0,0.38)',
                marginTop: 14,
              }}
            >
              GAME DESIGNER
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              style={{ width: 36, height: 1.5, background: 'rgba(0,0,0,0.14)', margin: '26px auto', transformOrigin: 'center' }}
            />

            {/* Instruction */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.25, 0.5] }}
              transition={{ delay: 1.1, duration: 1.2 }}
              style={{
                fontFamily: mono,
                fontSize: '8px',
                letterSpacing: '0.26em',
                color: 'rgba(0,0,0,0.32)',
              }}
            >
              TAP TO PLAY
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game canvas — always mounted so Phaser preloads behind boot screen */}
      {!stats && (
        <div className="absolute inset-0">
          <PhaserGame
            onComplete={handleComplete}
            onBack={goBack}
            onFragmentCollect={() => {}}
            tLeft={tLeft}
            tRight={tRight}
            tJump={tJump}
          />
        </div>
      )}

      {/* HUD — back button + keyboard hint — only after boot */}
      {!stats && booted && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pt-4 pointer-events-none">
          <button
            className="pointer-events-auto transition-opacity opacity-25 hover:opacity-60"
            style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.2em' }}
            onClick={goBack}
          >
            ← BACK
          </button>
          <span
            className="opacity-[0.12] hidden sm:block"
            style={{ fontFamily: mono, fontSize: '9px', letterSpacing: '0.18em' }}
          >
            ARROWS · SPACE · ESC
          </span>
        </div>
      )}

      {/* Touch controls — only after boot, no stats */}
      {!stats && booted && (
        <div className="absolute inset-0 z-40 pointer-events-none select-none">

          {/* LEFT */}
          <div
            className="pointer-events-auto absolute flex flex-col items-center gap-1"
            style={{ bottom: 36, left: 24 }}
          >
            <button
              onPointerDown={() => setTLeft(true)}
              onPointerUp={stopLeft}
              onPointerLeave={stopLeft}
              onPointerCancel={stopLeft}
            >
              <div
                className="flex items-center justify-center rounded-full border-2 border-black"
                style={{
                  width: 68, height: 68,
                  background: tLeft ? 'rgba(0,0,0,0.10)' : 'transparent',
                  opacity: 0.52,
                  transition: 'background 0.08s',
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 22 }}>←</span>
              </div>
            </button>
            <span style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.18em', color: 'rgba(0,0,0,0.28)' }}>LEFT</span>
          </div>

          {/* RIGHT */}
          <div
            className="pointer-events-auto absolute flex flex-col items-center gap-1"
            style={{ bottom: 36, left: 108 }}
          >
            <button
              onPointerDown={() => setTRight(true)}
              onPointerUp={stopRight}
              onPointerLeave={stopRight}
              onPointerCancel={stopRight}
            >
              <div
                className="flex items-center justify-center rounded-full border-2 border-black"
                style={{
                  width: 68, height: 68,
                  background: tRight ? 'rgba(0,0,0,0.10)' : 'transparent',
                  opacity: 0.52,
                  transition: 'background 0.08s',
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 22 }}>→</span>
              </div>
            </button>
            <span style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.18em', color: 'rgba(0,0,0,0.28)' }}>RIGHT</span>
          </div>

          {/* JUMP */}
          <div
            className="pointer-events-auto absolute flex flex-col items-center gap-1"
            style={{ bottom: 36, right: 24 }}
          >
            <button
              onPointerDown={() => setTJump(true)}
              onPointerUp={stopJump}
              onPointerLeave={stopJump}
              onPointerCancel={stopJump}
            >
              <div
                className="flex items-center justify-center rounded-full border-2 border-black"
                style={{
                  width: 80, height: 80,
                  background: tJump ? 'rgba(0,0,0,0.10)' : 'transparent',
                  opacity: 0.56,
                  transition: 'background 0.08s',
                }}
              >
                <span style={{ fontFamily: mono, fontSize: 26 }}>↑</span>
              </div>
            </button>
            <span style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.18em', color: 'rgba(0,0,0,0.28)' }}>JUMP</span>
          </div>

        </div>
      )}

      {/* ── COMPLETION SCREEN ────────────────────────────────────── */}
      <AnimatePresence>
        {stats && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-white z-50 flex items-center justify-center px-6"
          >
            <div style={{ maxWidth: 420, width: '100%' }}>

              {/* Header stamp */}
              <div style={{
                fontFamily: mono,
                fontSize: '8px',
                letterSpacing: '0.34em',
                color: 'rgba(0,0,0,0.22)',
                marginBottom: 32,
              }}>
                DHURUV M · GAME DESIGNER
              </div>

              {/* Main message */}
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: sans,
                  fontWeight: 900,
                  fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
                  letterSpacing: '-0.02em',
                  color: '#111',
                  lineHeight: 1.15,
                  marginBottom: 10,
                }}
              >
                You walked through<br />the skill set.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  fontFamily: sans,
                  fontSize: '14px',
                  color: 'rgba(0,0,0,0.42)',
                  lineHeight: 1.6,
                  marginBottom: 32,
                }}
              >
                Now see what those skills built.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.45 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px 24px',
                  padding: '20px 0',
                  borderTop: '1px solid rgba(0,0,0,0.07)',
                  borderBottom: '1px solid rgba(0,0,0,0.07)',
                  marginBottom: 28,
                }}
              >
                {([
                  ['TIME',  fmtTime(stats.timeMs)],
                  ['JUMPS', stats.jumps.toString()],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.28em', color: 'rgba(0,0,0,0.25)', marginBottom: 5 }}>{label}</div>
                    <div style={{ fontFamily: sans, fontSize: '22px', fontWeight: 700, color: '#111' }}>{value}</div>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {/* Primary CTA */}
                <button
                  onClick={goProjects}
                  style={{
                    width: '100%',
                    fontFamily: mono,
                    fontSize: '11px',
                    letterSpacing: '0.16em',
                    border: 'none',
                    borderRadius: 6,
                    padding: '14px 18px',
                    background: '#111',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  VIEW MY PROJECTS →
                </button>

                {/* Secondary */}
                <button
                  onClick={goBack}
                  style={{
                    width: '100%',
                    fontFamily: mono,
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    border: '1.5px solid rgba(0,0,0,0.14)',
                    borderRadius: 6,
                    padding: '11px 18px',
                    background: 'white',
                    cursor: 'pointer',
                    color: 'rgba(0,0,0,0.42)',
                    transition: 'opacity 0.15s',
                  }}
                >
                  ← BACK TO HOME
                </button>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
