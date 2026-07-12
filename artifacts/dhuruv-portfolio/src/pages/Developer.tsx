import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';
import DevPhaserGame from '@/game/DevPhaserGame';
import { REPOS } from '@/game/DevScene';
import dreamroomsThumb from '@assets/dreamrooms-thumb.jpg';
import dreamroomsMenu  from '@assets/dreamrooms-menu.jpg';

const REPO_MEDIA: { thumb?: string; screenshots?: string[] }[] = [
  { thumb: dreamroomsThumb, screenshots: [dreamroomsMenu] }, // the-dreamrooms
  {},  // echoes-of-the-void
  {},  // pixel-rush
  {},  // arena-tactics
  {},  // dhuruv-portfolio
];

const mono = "'Space Mono', monospace";
const sans = "'Inter', sans-serif";

export default function Developer() {
  const [, navigate] = useLocation();
  const [overlayScope, animateOverlay] = useAnimate();

  const [booted,      setBooted]      = useState(false);
  const [activeRepo,  setActiveRepo]  = useState<number | null>(null);
  const [ended,       setEnded]       = useState(false);

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

  // Boot screen auto-advance
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const resetAll = useCallback(() => {
    setTLeft(false); setTRight(false); setTJump(false);
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

  const goAbout = useCallback(async () => {
    resetAll();
    await animateOverlay(
      overlayScope.current,
      { clipPath: 'circle(150% at 50% 50%)' },
      { duration: 0.45, ease: [0.76, 0, 0.24, 1] },
    );
    navigate('/about');
  }, [animateOverlay, overlayScope, navigate, resetAll]);

  const handleRepoEnter = useCallback((idx: number) => setActiveRepo(idx), []);
  const handleRepoLeave = useCallback(() => setActiveRepo(null), []);
  const handleEnd       = useCallback(() => setEnded(true), []);

  useEffect(() => {
    window.addEventListener('blur',            resetAll);
    window.addEventListener('visibilitychange', resetAll);
    return () => {
      window.removeEventListener('blur',             resetAll);
      window.removeEventListener('visibilitychange', resetAll);
    };
  }, [resetAll]);

  const repo = activeRepo !== null ? REPOS[activeRepo] : null;

  return (
    <div
      className="fixed inset-0 bg-white overflow-hidden"
      style={{ fontFamily: sans, touchAction: 'none' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;700;900&display=swap');
        * { -webkit-tap-highlight-color: transparent; user-select: none; }
        .dev-link { user-select: auto; }
      `}</style>

      {/* Circle overlay */}
      <div
        ref={overlayScope}
        className="fixed inset-0 bg-black z-[9999] pointer-events-none"
        style={{ clipPath: 'circle(150% at 50% 50%)' }}
      />

      {/* ── BOOT SCREEN ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!booted && !ended && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03, filter: 'blur(4px)' }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center cursor-pointer select-none"
            onClick={() => setBooted(true)}
          >
            <div style={{ fontFamily: mono, fontSize: '8px', letterSpacing: '0.38em', color: 'rgba(0,0,0,0.22)', marginBottom: 28 }}>
              PORTFOLIO · INTERACTIVE
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: sans, fontWeight: 900, fontSize: 'clamp(2.8rem, 11vw, 6.5rem)', letterSpacing: '-0.03em', lineHeight: 1, color: '#111' }}
            >
              DHURUV M
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.32em', color: 'rgba(0,0,0,0.38)', marginTop: 14 }}
            >
              GAME DEVELOPER
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              style={{ width: 36, height: 1.5, background: 'rgba(0,0,0,0.14)', margin: '26px auto', transformOrigin: 'center' }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.25, 0.5] }}
              transition={{ delay: 1.1, duration: 1.2 }}
              style={{ fontFamily: mono, fontSize: '8px', letterSpacing: '0.26em', color: 'rgba(0,0,0,0.32)' }}
            >
              TAP TO PLAY
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phaser canvas */}
      {!ended && (
        <div className="absolute inset-0">
          <DevPhaserGame
            onRepoEnter={handleRepoEnter}
            onRepoLeave={handleRepoLeave}
            onEnd={handleEnd}
            onBack={goBack}
            tLeft={tLeft}
            tRight={tRight}
            tJump={tJump}
          />
        </div>
      )}

      {/* ── HUD ─────────────────────────────────────────────────── */}
      {!ended && booted && (
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

      {/* ── REPO CARD OVERLAY ───────────────────────────────────── */}
      {/* Rendered in HTML so links are real & clickable */}
      <AnimatePresence>
        {booted && !ended && repo && (() => {
          const media  = REPO_MEDIA[activeRepo ?? 0] ?? {};
          const isInDev = repo.inDev ?? false;
          const accentColor = isInDev ? '#f97316' : '#1a7f37';
          return (
            <motion.div
              key={`repo-${activeRepo}`}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-40 pointer-events-none"
              style={{
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(calc(100vw - 48px), 440px)',
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.98)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 4px 28px rgba(0,0,0,0.09)',
                  position: 'relative',
                }}
              >
                {/* Left accent bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accentColor, zIndex: 2 }} />

                {/* Thumbnail image (shown when available) */}
                {media.thumb && (
                  <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                    <img
                      src={media.thumb}
                      alt={repo.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Dark gradient over image */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)',
                    }} />
                    {/* "UNDER DEVELOPMENT" pill on image */}
                    {isInDev && (
                      <div style={{
                        position: 'absolute', bottom: 10, right: 12,
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(249,115,22,0.92)',
                        borderRadius: 20,
                        padding: '4px 10px',
                        backdropFilter: 'blur(4px)',
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: '#fff',
                          display: 'inline-block',
                          animation: 'pulse 1.4s ease-in-out infinite',
                        }} />
                        <span style={{
                          fontFamily: mono, fontSize: '8px', letterSpacing: '0.16em', color: '#fff',
                        }}>UNDER DEVELOPMENT</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Screenshot strip (show menu screenshot below thumb if available) */}
                {media.screenshots && media.screenshots.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, padding: '4px 4px 0', background: '#f6f6f6' }}>
                    {media.screenshots.map((src, si) => (
                      <img
                        key={si}
                        src={src}
                        alt={`screenshot-${si}`}
                        style={{ flex: 1, height: 52, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ padding: '14px 22px 16px 24px' }}>
                  {/* Repo number + label */}
                  <div style={{ fontFamily: mono, fontSize: '8px', letterSpacing: '0.3em', color: 'rgba(0,0,0,0.25)', marginBottom: 6 }}>
                    REPO / {String((activeRepo ?? 0) + 1).padStart(2, '0')}
                  </div>

                  {/* Project name + dev badge row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <h2 style={{ fontFamily: mono, fontWeight: 700, fontSize: 'clamp(13px, 3.2vw, 18px)', color: '#111', lineHeight: 1.2, margin: 0 }}>
                      {repo.name}
                    </h2>
                    {isInDev && !media.thumb && (
                      <span style={{
                        fontFamily: mono, fontSize: '7px', letterSpacing: '0.14em',
                        background: '#fff7ed', color: '#f97316',
                        border: '1px solid #fed7aa',
                        borderRadius: 20, padding: '2px 8px',
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        ● UNDER DEVELOPMENT
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ fontFamily: sans, fontSize: '11.5px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: 12 }}>
                    {repo.desc}
                  </p>

                  {/* Tech stack */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {repo.stack.map(t => (
                      <span
                        key={t}
                        style={{
                          fontFamily: mono,
                          fontSize: '8px',
                          letterSpacing: '0.12em',
                          color: 'rgba(0,0,0,0.55)',
                          border: '1px solid rgba(0,0,0,0.14)',
                          borderRadius: 3,
                          padding: '2px 7px',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Link buttons — pointer-events-auto so they're clickable */}
                  <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
                    {repo.github && (
                      <a
                        href={repo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: mono, fontSize: '9px', letterSpacing: '0.14em',
                          border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: 5,
                          padding: '6px 12px', color: 'rgba(0,0,0,0.65)',
                          textDecoration: 'none', display: 'inline-block',
                          background: 'white', transition: 'all 0.15s', userSelect: 'auto',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                      >
                        GITHUB ↗
                      </a>
                    )}
                    {repo.demo && (
                      <a
                        href={repo.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: mono, fontSize: '9px', letterSpacing: '0.14em',
                          border: 'none', borderRadius: 5, padding: '6px 12px',
                          color: '#fff', textDecoration: 'none', display: 'inline-block',
                          background: '#111', transition: 'opacity 0.15s', userSelect: 'auto',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        LIVE DEMO ↗
                      </a>
                    )}
                    {isInDev && !repo.github && !repo.demo && (
                      <span style={{
                        fontFamily: mono, fontSize: '9px', letterSpacing: '0.12em',
                        color: '#f97316', padding: '6px 0',
                      }}>
                        Coming soon…
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── TOUCH CONTROLS ──────────────────────────────────────── */}
      {!ended && booted && (
        <div className="absolute inset-0 z-40 pointer-events-none select-none">
          {/* LEFT */}
          <div className="pointer-events-auto absolute flex flex-col items-center gap-1" style={{ bottom: 36, left: 24 }}>
            <button onPointerDown={() => setTLeft(true)} onPointerUp={stopLeft} onPointerLeave={stopLeft} onPointerCancel={stopLeft}>
              <div className="flex items-center justify-center rounded-full border-2 border-black"
                style={{ width: 68, height: 68, background: tLeft ? 'rgba(0,0,0,0.10)' : 'transparent', opacity: 0.52, transition: 'background 0.08s' }}>
                <span style={{ fontFamily: mono, fontSize: 22 }}>←</span>
              </div>
            </button>
            <span style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.18em', color: 'rgba(0,0,0,0.28)' }}>LEFT</span>
          </div>

          {/* RIGHT */}
          <div className="pointer-events-auto absolute flex flex-col items-center gap-1" style={{ bottom: 36, left: 108 }}>
            <button onPointerDown={() => setTRight(true)} onPointerUp={stopRight} onPointerLeave={stopRight} onPointerCancel={stopRight}>
              <div className="flex items-center justify-center rounded-full border-2 border-black"
                style={{ width: 68, height: 68, background: tRight ? 'rgba(0,0,0,0.10)' : 'transparent', opacity: 0.52, transition: 'background 0.08s' }}>
                <span style={{ fontFamily: mono, fontSize: 22 }}>→</span>
              </div>
            </button>
            <span style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.18em', color: 'rgba(0,0,0,0.28)' }}>RIGHT</span>
          </div>

          {/* JUMP */}
          <div className="pointer-events-auto absolute flex flex-col items-center gap-1" style={{ bottom: 36, right: 24 }}>
            <button onPointerDown={() => setTJump(true)} onPointerUp={stopJump} onPointerLeave={stopJump} onPointerCancel={stopJump}>
              <div className="flex items-center justify-center rounded-full border-2 border-black"
                style={{ width: 80, height: 80, background: tJump ? 'rgba(0,0,0,0.10)' : 'transparent', opacity: 0.56, transition: 'background 0.08s' }}>
                <span style={{ fontFamily: mono, fontSize: 26 }}>↑</span>
              </div>
            </button>
            <span style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.18em', color: 'rgba(0,0,0,0.28)' }}>JUMP</span>
          </div>
        </div>
      )}

      {/* ── END SCREEN ──────────────────────────────────────────── */}
      <AnimatePresence>
        {ended && (
          <motion.div
            key="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-white z-50 flex items-center justify-center px-6"
          >
            <div style={{ maxWidth: 420, width: '100%' }}>
              <div style={{ fontFamily: mono, fontSize: '8px', letterSpacing: '0.34em', color: 'rgba(0,0,0,0.22)', marginBottom: 32 }}>
                DHURUV M · GAME DEVELOPER
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: sans, fontWeight: 900, fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', letterSpacing: '-0.02em', color: '#111', lineHeight: 1.15, marginBottom: 10 }}
              >
                You walked through<br />the repositories.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontFamily: sans, fontSize: '14px', color: 'rgba(0,0,0,0.42)', lineHeight: 1.6, marginBottom: 32 }}
              >
                {REPOS.length} repos. Real projects. Now see who built them.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.45 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <button
                  onClick={goAbout}
                  style={{
                    width: '100%', fontFamily: mono, fontSize: '11px',
                    letterSpacing: '0.16em', border: 'none', borderRadius: 6,
                    padding: '14px 18px', background: '#111', color: '#fff',
                    cursor: 'pointer', transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  ABOUT ME →
                </button>
                <button
                  onClick={goBack}
                  style={{
                    width: '100%', fontFamily: mono, fontSize: '10px',
                    letterSpacing: '0.15em', border: '1.5px solid rgba(0,0,0,0.14)',
                    borderRadius: 6, padding: '11px 18px', background: 'white',
                    cursor: 'pointer', color: 'rgba(0,0,0,0.42)', transition: 'opacity 0.15s',
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
