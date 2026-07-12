import { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useAnimate,
} from 'framer-motion';
import { useLocation } from 'wouter';
import characterImg from '@assets/character.png';
import Nav from '@/components/Nav';

const ROLES = ['Game Designer', 'Developer'] as const;
type Role = typeof ROLES[number];
const ROLE_ROUTES: Record<Role, string> = {
  'Game Designer': '/game',
  'Developer':     '/developer',
};

const mono = "'Space Mono', monospace";
const sans = "'Inter', sans-serif";

export default function Home() {
  const [displayedText, setDisplayedText] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [charVisible, setCharVisible] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'main'>('intro');
  const [droppedRole, setDroppedRole] = useState<Role | null>(null);
  const [draggingRole, setDraggingRole] = useState<Role | null>(null);
  const [dropHovering, setDropHovering] = useState(false);

  const [, navigate] = useLocation();
  const [overlayScope, animateOverlay] = useAnimate();
  const fullText = "Hi! I'm";


  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let nameTimer: ReturnType<typeof setTimeout>;
    let charTimer: ReturnType<typeof setTimeout>;
    let completeTimer: ReturnType<typeof setTimeout>;

    const startDelay = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i++;
        setDisplayedText(fullText.slice(0, i));
        if (i === fullText.length) {
          clearInterval(interval);
          nameTimer = setTimeout(() => setNameVisible(true), 200);
          charTimer = setTimeout(() => setCharVisible(true), 650);
          completeTimer = setTimeout(() => setTypingComplete(true), 1400);
        }
      }, 110);
    }, 400);

    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
      clearTimeout(nameTimer);
      clearTimeout(charTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const transitionToMain = () => {
    if (typingComplete && phase === 'intro') setPhase('main');
  };

  const onDragStart = (role: Role) => setDraggingRole(role);
  const onDragEnd = () => { setDraggingRole(null); setDropHovering(false); };
  const onDropZoneDragOver = (e: React.DragEvent) => { e.preventDefault(); setDropHovering(true); };
  const onDropZoneDragLeave = () => setDropHovering(false);

  const selectRole = async (role: Role | null) => {
    await animateOverlay(overlayScope.current, {
      clipPath: 'circle(150% at 50% 50%)',
    }, { duration: 0.45, ease: [0.76, 0, 0.24, 1] });

    if (role && ROLE_ROUTES[role]) {
      navigate(ROLE_ROUTES[role]);
      return;
    }

    setDroppedRole(role);
    await animateOverlay(overlayScope.current, {
      clipPath: 'circle(0% at 50% 50%)',
    }, { duration: 0.4, ease: [0.76, 0, 0.24, 1] });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingRole) selectRole(draggingRole);
    setDropHovering(false);
    setDraggingRole(null);
  };

  return (
    <div className="bg-white w-full h-[100dvh] overflow-hidden" style={{ fontFamily: sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;700;900&display=swap');
        [draggable=true] { user-select: none; -webkit-user-drag: element; }

      `}</style>

      {/* Black circle overlay — sits above everything, pointer-events off */}
      <div
        ref={overlayScope}
        className="fixed inset-0 bg-black z-[9999] pointer-events-none"
        style={{ clipPath: 'circle(0% at 50% 50%)' }}
      />

      <Nav />

      <section
        className="relative h-[100dvh]"
        style={{ cursor: typingComplete && phase === 'intro' ? 'pointer' : 'default' }}
        onClick={transitionToMain}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') transitionToMain(); }}
        tabIndex={phase === 'intro' && typingComplete ? 0 : -1}
        aria-label={phase === 'intro' && typingComplete ? 'Press Enter or Space to continue' : undefined}
      >
        {/* Intro phase */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              key="intro"
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-start pt-[18vh] sm:pt-[20vh] z-10 pointer-events-none"
            >
              <div className="flex items-center justify-center h-9 sm:h-11">
                <span
                  className="text-lg sm:text-2xl text-black/60 tracking-[0.18em]"
                  style={{ fontFamily: mono }}
                >
                  {displayedText}
                </span>
                <motion.span
                  animate={typingComplete ? { opacity: [1, 0, 1] } : { opacity: 1 }}
                  transition={typingComplete ? { repeat: Infinity, duration: 1 } : {}}
                  className="inline-block w-[2px] h-5 sm:h-6 bg-black/40 ml-1.5 rounded-sm"
                />
              </div>

              <div className="h-20 sm:h-24 md:h-32 flex items-center justify-center mt-1 sm:mt-2">
                <AnimatePresence>
                  {nameVisible && (
                    <motion.h1
                      initial={{ scale: 0.4, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.9 }}
                      className="text-center font-black leading-none text-black"
                      style={{
                        fontFamily: sans,
                        fontSize: 'clamp(3.2rem, 11vw, 7.5rem)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      DHURUV M
                    </motion.h1>
                  )}
                </AnimatePresence>
              </div>

              {typingComplete && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-6 text-xs tracking-widest text-black/30 uppercase"
                  style={{ fontFamily: mono, letterSpacing: '0.25em' }}
                >
                  tap / press Enter to continue
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main phase */}
        <AnimatePresence>
          {phase === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-start pt-[18vh] sm:pt-[20vh] z-10 pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex flex-wrap items-baseline justify-center gap-x-2 px-4 pointer-events-auto"
                style={{ fontFamily: mono }}
              >
                <span className="text-xl sm:text-3xl md:text-4xl text-black/70 tracking-[0.12em] whitespace-nowrap">
                  Hi! I'm a
                </span>

                {droppedRole ? (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    onClick={() => selectRole(null)}
                    className="text-xl sm:text-3xl md:text-4xl font-bold cursor-pointer bg-transparent border-0 p-0"
                    style={{
                      color: 'rgba(0,0,0,0.85)',
                      textDecoration: 'underline',
                      textUnderlineOffset: '5px',
                      fontFamily: mono,
                      letterSpacing: '0.06em',
                    }}
                    title="Click to clear"
                  >
                    {droppedRole}
                  </motion.button>
                ) : (
                  <span
                    onDragOver={onDropZoneDragOver}
                    onDragLeave={onDropZoneDragLeave}
                    onDrop={onDrop}
                    className="text-xl sm:text-3xl md:text-4xl italic"
                    style={{
                      color: dropHovering ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)',
                      textDecoration: 'underline',
                      textUnderlineOffset: '5px',
                      fontFamily: mono,
                      letterSpacing: '0.06em',
                      background: dropHovering ? 'rgba(0,0,0,0.05)' : 'transparent',
                      borderRadius: 4,
                      padding: '0 4px',
                      transition: 'all 0.2s',
                    }}
                  >
                    [Drop Here]
                  </span>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
                className="mt-5 sm:mt-7 pointer-events-auto"
                style={{
                  border: '1.5px dashed rgba(0,0,0,0.25)',
                  borderRadius: 10,
                  padding: '10px 18px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.01)',
                  maxWidth: 'min(90vw, 520px)',
                }}
              >
                {ROLES.map((role) => (
                  <motion.button
                    key={role}
                    draggable
                    onDragStart={() => onDragStart(role)}
                    onDragEnd={onDragEnd}
                    onClick={() => selectRole(role)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectRole(role);
                      }
                    }}
                    whileHover={{ scale: 1.06, backgroundColor: 'rgba(0,0,0,0.06)' }}
                    whileTap={{ scale: 0.96 }}
                    animate={draggingRole === role ? { opacity: 0.4 } : { opacity: 1 }}
                    style={{
                      fontFamily: mono,
                      fontSize: '0.82rem',
                      border: `1.5px solid ${droppedRole === role ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.22)'}`,
                      borderRadius: 6,
                      padding: '5px 12px',
                      color: 'rgba(0,0,0,0.75)',
                      cursor: 'grab',
                      background: droppedRole === role ? 'rgba(0,0,0,0.06)' : 'white',
                      userSelect: 'none',
                      letterSpacing: '0.04em',
                    }}
                  >
                    [{role}]
                  </motion.button>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-4 text-[11px] tracking-widest text-black/25 uppercase"
                style={{ fontFamily: mono, letterSpacing: '0.2em' }}
              >
                drag or tap a role
              </motion.p>

              {/* Scroll down → goes to Projects page */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                onClick={() => navigate('/projects')}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <span className="text-[10px] text-black/30 tracking-[0.3em] uppercase" style={{ fontFamily: mono }}>
                  View Work
                </span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  className="w-px h-8 bg-gradient-to-b from-black/30 to-transparent"
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character — fixed bottom, one-time pop-in, no float */}
        {charVisible && (
          <motion.div
            initial={{ y: '100%', scale: 0.85 }}
            animate={{ y: '0%', scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16, mass: 0.9 }}
            className="absolute bottom-0 left-0 right-0 flex justify-center items-end z-20 pointer-events-none"
          >
            <div style={{ textAlign: 'center' }}>
              <div
                className="mx-auto rounded-full bg-black/15 blur-xl"
                style={{ width: '60%', height: 12, marginBottom: -2 }}
              />
              <img
                src={characterImg}
                alt="Dhuruv M"
                style={{
                  height: 'clamp(180px, 38vh, 340px)',
                  width: 'auto',
                  maxWidth: '90vw',
                  display: 'block',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  filter: 'drop-shadow(0 4px 18px rgba(0,0,0,0.10))',
                }}
              />
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
