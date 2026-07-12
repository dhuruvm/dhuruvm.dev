import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Nav from '@/components/Nav';
import PeekMascot from '@/components/PeekMascot';
import dreamroomsThumb from '@assets/dreamrooms-thumb.jpg';
import dreamroomsMenu  from '@assets/dreamrooms-menu.jpg';
import dreamroomsVideo from '@assets/dreamrooms-gameplay.mp4';

const mono = "'Space Mono', monospace";
const sans = "'Inter', sans-serif";

/* ─── Dreamrooms inline video player ────────────────────────── */
function DreamroomsMedia() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted,   setMuted]   = useState(true);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  }

  return (
    <div className="mt-6 mb-2">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { src: dreamroomsThumb, label: 'TITLE CARD' },
          { src: dreamroomsMenu,  label: 'MAIN MENU' },
        ].map(({ src, label }) => (
          <div key={label} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <img src={src} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
            <span className="absolute bottom-2 left-2.5" style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div
        className="relative rounded-lg overflow-hidden cursor-pointer"
        style={{ aspectRatio: '16/9', background: '#111' }}
        onClick={toggle}
      >
        <video
          ref={ref}
          src={dreamroomsVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent 65%, rgba(0,0,0,0.45) 100%)',
        }} />

        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{ opacity: playing ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center justify-center rounded-full"
            style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
          </div>
        </motion.div>

        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)' }}>
              GAMEPLAY FOOTAGE
            </span>
          </div>
          <button
            onClick={() => {
              if (!ref.current) return;
              ref.current.muted = !ref.current.muted;
              setMuted(ref.current.muted);
            }}
            style={{ fontFamily: mono, fontSize: '7px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {muted ? '🔇 UNMUTE' : '🔊 MUTE'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Projects() {
  const [detailOpen, setDetailOpen] = useState(true);

  return (
    <div className="bg-white min-h-screen w-full" style={{ fontFamily: sans }}>
      <Nav />
      <PeekMascot />

      <main className="w-full px-6 sm:px-12 lg:px-24 pt-32 pb-24">
        <div className="max-w-5xl mx-auto">

          {/* ── Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-baseline gap-4 mb-14"
          >
            <h1 className="text-4xl sm:text-5xl font-black text-black" style={{ letterSpacing: '-0.025em' }}>
              Projects
            </h1>
            <span style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.24em', color: 'rgba(0,0,0,0.25)' }}>
              CURRENT
            </span>
          </motion.div>

          {/* ── Single project list */}
          <div className="flex flex-col">
            <div className="h-px bg-black/10 w-full" />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ── clickable header row */}
              <motion.div
                role="button"
                tabIndex={0}
                onClick={() => setDetailOpen(o => !o)}
                onKeyDown={e => e.key === 'Enter' && setDetailOpen(o => !o)}
                aria-expanded={detailOpen}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                transition={{ duration: 0.2 }}
                className="w-full text-left py-8 sm:py-10 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10 rounded-sm cursor-pointer"
              >
                {/* Number */}
                <span
                  className="text-[11px] tracking-[0.2em] shrink-0 pt-1 sm:pt-2"
                  style={{ fontFamily: mono, color: 'rgba(0,0,0,0.3)', minWidth: 28 }}
                >
                  01
                </span>

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <h2
                      className="text-xl sm:text-2xl font-black text-black leading-tight"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      THE DREAMROOMS
                    </h2>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-black/35" style={{ fontFamily: mono }}>2026</span>
                      <motion.span animate={{ rotate: detailOpen ? 45 : 0 }} transition={{ duration: 0.25 }} className="text-black/30 text-lg leading-none">
                        +
                      </motion.span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-4">
                    {['Horror', 'First-Person', 'PC'].map((tag, ti, arr) => (
                      <span key={tag} className="flex items-center gap-2">
                        <span className="text-[10px] text-black/45 tracking-[0.15em] uppercase" style={{ fontFamily: mono }}>{tag}</span>
                        {ti < arr.length - 1 && <span className="text-black/20 text-[10px]">·</span>}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-[14px] sm:text-[15px] text-black/55 leading-relaxed max-w-xl">
                    A first-person psychological horror game set in infinite backrooms-style corridors.
                    Atmospheric lighting, threatening entities, and a world that shifts while you walk through it.
                    Currently in active development.
                  </p>
                </div>
              </motion.div>

              {/* ── expanded detail */}
              <AnimatePresence initial={false}>
                {detailOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden pl-0 sm:pl-[calc(28px+2.5rem)]"
                  >
                    <div className="pb-8">
                      <DreamroomsMedia />

                      <div className="grid sm:grid-cols-2 gap-6 pt-5 border-t border-black/10 max-w-xl" style={{ marginTop: 16 }}>
                        <div>
                          <span className="text-[10px] text-black/30 tracking-[0.25em] uppercase block mb-1.5" style={{ fontFamily: mono }}>Role</span>
                          <p className="text-[13px] text-black/65">Solo Developer & Designer</p>
                          <span className="text-[10px] text-black/30 tracking-[0.25em] uppercase block mb-1.5 mt-4" style={{ fontFamily: mono }}>Built with</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['Unity', 'C#', 'URP', 'Blender'].map(tool => (
                              <span key={tool} className="text-[10px] text-black/55 border border-black/15 rounded px-1.5 py-0.5" style={{ fontFamily: mono }}>
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-black/30 tracking-[0.25em] uppercase block mb-1.5" style={{ fontFamily: mono }}>The hard part</span>
                          <p className="text-[13px] text-black/60 leading-relaxed">
                            Creating genuine dread without jump scares. Every entity behaviour and room
                            transition is hand-tuned to build unease over time — not shock.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="h-px bg-black/10 w-full" />
          </div>
        </div>
      </main>

      <footer className="px-6 sm:px-12 lg:px-24 pb-10">
        <div className="max-w-5xl mx-auto border-t border-black/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[11px] text-black/25 tracking-[0.2em] uppercase" style={{ fontFamily: mono }}>
            Dhuruv M — {new Date().getFullYear()}
          </span>
          <span className="text-[11px] text-black/20 tracking-[0.15em] uppercase" style={{ fontFamily: mono }}>
            Game Designer · Game Developer
          </span>
        </div>
      </footer>
    </div>
  );
}
