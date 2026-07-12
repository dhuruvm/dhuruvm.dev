import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import peekIdle from '@assets/peek-idle.png';
import peekReact from '@assets/peek-react.png';

export default function PeekMascot() {
  const [reacting, setReacting] = useState(false);
  const lastYRef = useRef(0);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduceMotion) return;
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    lastYRef.current = Math.min(Math.max(window.scrollY, 0), maxScroll());
    const onScroll = () => {
      const y = Math.min(Math.max(window.scrollY, 0), maxScroll());
      const delta = y - lastYRef.current;
      if (Math.abs(delta) < 2) return;
      setReacting(delta > 0);
      lastYRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduceMotion]);

  return (
    <div
      className="fixed left-0 z-40 pointer-events-none select-none -translate-y-1/2"
      style={{ top: '40%' }}
      aria-hidden="true"
    >
      <motion.div
        animate={reduceMotion ? {} : { y: reacting ? [0, -6, 0] : [0, -5, 0] }}
        transition={{
          repeat: Infinity,
          duration: reacting ? 0.35 : 3.2,
          ease: 'easeInOut',
        }}
        style={{
          height: 'clamp(70px, 12vw, 210px)',
          width: 'auto',
          position: 'relative',
          display: 'block',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={reacting ? 'react' : 'idle'}
            src={reacting ? peekReact : peekIdle}
            alt=""
            initial={{ opacity: 0, scale: 0.94, rotate: reacting ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ display: 'block', height: '100%', width: 'auto' }}
          />
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
