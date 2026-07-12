import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Nav from '@/components/Nav';
import aboutIllustration from '@assets/about-illustration.png';

const mono = "'Space Mono', monospace";
const sans = "'Inter', sans-serif";

const SKILLS = [
  'Game Design',
  'Systems Design',
  'Level Design',
  'Narrative Design',
  'Game Direction',
  'Prototyping',
  'UX / Playtesting',
  'Game Development',
];

const STATS = [
  { value: 4, suffix: '+', label: 'Games Shipped' },
  { value: 50, suffix: 'k+', label: 'Players Reached' },
  { value: 3, suffix: '', label: 'Jam Awards' },
];

const LOG = [
  {
    tag: 'ORIGIN',
    title: 'Why games',
    body: "Started modding levels before I could explain what a game loop was. Got obsessed with the gap between a mechanic that's technically correct and one that actually feels good in the hand.",
  },
  {
    tag: 'CRAFT',
    title: 'How I work',
    body: 'Design doc → direction → build → playtest → ship, on repeat. I run the process whether it\'s a solo jam game or a team production — same rigor, different scale.',
  },
  {
    tag: 'NOW',
    title: 'Currently',
    body: (
      <>
        Deep in <span className="font-semibold text-black/85">Echoes of the Void</span>, a
        psychological horror where sound replaces sight. Always reading pitches for the right collab.
      </>
    ),
  },
];

function Stat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col"
    >
      <span ref={ref} className="text-2xl font-black text-black tabular-nums" style={{ fontFamily: sans }}>
        {display}
        {suffix}
      </span>
      <span
        className="text-[10px] text-black/35 tracking-[0.2em] uppercase mt-0.5"
        style={{ fontFamily: mono }}
      >
        {label}
      </span>
    </motion.div>
  );
}

function SkillChip({ skill }: { skill: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 14 });
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      whileHover={{ scale: 1.06, borderColor: 'rgba(0,0,0,0.45)', backgroundColor: 'rgba(0,0,0,0.03)' }}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      style={{ fontFamily: mono, letterSpacing: '0.04em', transformPerspective: 300 }}
      className="text-[12px] text-black/65 border border-black/15 rounded-full px-3 py-1 inline-block cursor-default"
    >
      {skill}
    </motion.span>
  );
}

export default function About() {
  const mouseRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 40, damping: 16 };
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springCfg);
  const parallaxY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springCfg);

  // Motion values update outside React state, so this doesn't trigger re-renders on every move.
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mouseRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div className="bg-white min-h-screen w-full" style={{ fontFamily: sans }}>
      <Nav />

      <main
        ref={mouseRef}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
        className="w-full px-6 sm:px-12 lg:px-24 pt-32 pb-24 bg-black/[0.02] min-h-screen relative overflow-hidden"
      >
        {/* Companion illustration, parallax-reactive. Positioned against the
            content wrapper (which sizes to its content) rather than this
            min-h-screen main, so it never ends up far below the fold. */}
        <div className="max-w-5xl mx-auto">
          {/* Header row: title/badge on left, illustration on right — flex so they never overlap */}
          <div className="flex items-start justify-between mb-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4 mb-4"
              >
                <h1
                  className="text-4xl sm:text-5xl font-black text-black"
                  style={{ fontFamily: sans, letterSpacing: '-0.025em' }}
                >
                  About
                </h1>
              </motion.div>

            </div>

            <motion.img
              src={aboutIllustration}
              alt=""
              aria-hidden
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block flex-shrink-0 pointer-events-none select-none"
              style={{
                x: parallaxX,
                y: parallaxY,
                height: 'clamp(110px, 22vw, 260px)',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))',
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[16px] sm:text-[17px] text-black/70 leading-[1.75] mb-6">
                I'm Dhuruv — a game designer and developer who can't stop thinking
                about how games <em>feel</em>. Not just look. The way a mechanic teaches
                itself without a tutorial. The half-second pause before a jump.
                The sound a bad menu makes.
              </p>
              <p className="text-[16px] sm:text-[17px] text-black/70 leading-[1.75] mb-6">
                I cover the full arc — concept and design doc through to build,
                playtest, and ship. Solo or on a team, the aim is always the same:
                something specific, deliberate, and hard to put down.
              </p>

              {/* Quest log style timeline */}
              <div className="mt-10 flex flex-col gap-0 border-l border-black/10 pl-6">
                {LOG.map((entry, i) => (
                  <motion.div
                    key={entry.tag}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-15% 0px' }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="relative pb-8 last:pb-0"
                  >
                    <span
                      className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-black/40"
                    />
                    <span
                      className="text-[10px] text-black/35 tracking-[0.25em] uppercase block mb-1.5"
                      style={{ fontFamily: mono }}
                    >
                      {entry.tag}
                    </span>
                    <h3 className="text-[15px] font-bold text-black mb-1">{entry.title}</h3>
                    <p className="text-[14px] text-black/55 leading-relaxed max-w-md">{entry.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-8"
            >
              <div>
                <span
                  className="text-[10px] text-black/30 tracking-[0.3em] uppercase block mb-3"
                  style={{ fontFamily: mono }}
                >
                  What I do
                </span>
                <div className="flex flex-wrap gap-2" style={{ perspective: 400 }}>
                  {SKILLS.map((skill) => (
                    <SkillChip key={skill} skill={skill} />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                {STATS.map((stat, i) => (
                  <Stat key={stat.label} {...stat} delay={0.3 + i * 0.12} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="px-6 sm:px-12 lg:px-24 pb-10 bg-black/[0.02]">
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
