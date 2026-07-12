import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import illustration from '@assets/404-illustration.png';

const mono = "'Space Mono', monospace";
const sans = "'Inter', sans-serif";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ fontFamily: sans }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;700;900&display=swap');
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center max-w-lg w-full"
      >
        <motion.img
          src={illustration}
          alt="Character sitting on 404"
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 'clamp(260px, 60vw, 420px)',
            height: 'auto',
            display: 'block',
            filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.08))',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-black/35"
            style={{ fontFamily: mono }}
          >
            Page not found
          </p>

          <h1
            className="text-3xl sm:text-4xl font-black text-black leading-tight"
            style={{ fontFamily: sans, letterSpacing: '-0.025em' }}
          >
            Nothing to see here.
          </h1>

          <p
            className="text-[15px] text-black/50 leading-relaxed max-w-sm"
            style={{ fontFamily: sans }}
          >
            That page doesn't exist — or maybe it never did. Either way, I'm
            just chilling on a 404 and that's fine.
          </p>

          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ backgroundColor: 'rgba(0,0,0,1)', color: '#fff', scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="mt-4 px-7 py-3 rounded-full text-[13px] font-medium text-black border border-black/25 transition-colors"
            style={{ fontFamily: mono, letterSpacing: '0.05em' }}
          >
            ← Back home
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <span
          className="text-[10px] text-black/20 tracking-[0.2em] uppercase"
          style={{ fontFamily: mono }}
        >
          Dhuruv M — {new Date().getFullYear()}
        </span>
      </motion.div>
    </div>
  );
}
