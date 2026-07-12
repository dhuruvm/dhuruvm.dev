import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/Nav';
import contactIllustration from '@assets/contact-illustration.png';

const mono = "'Space Mono', monospace";
const sans = "'Inter', sans-serif";

const EMAIL = 'hi@dhuruvm.dev';

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/dhuruvm' },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      // clipboard unavailable — the mailto link below still works
    }
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return; // don't hijack Cmd/Ctrl+C etc.
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (!typing && e.key.toLowerCase() === 'c') copyEmail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="bg-white min-h-screen w-full" style={{ fontFamily: sans }}>
      <Nav />

      <main className="w-full px-6 sm:px-12 lg:px-24 pt-32 pb-24 relative overflow-x-hidden">
        <div className="max-w-5xl mx-auto relative">
          <motion.img
            src={contactIllustration}
            alt=""
            aria-hidden
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block absolute pointer-events-none select-none"
            style={{
              right: '12%',
              bottom: '-24px',
              height: 'clamp(220px, 26vw, 400px)',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))',
            }}
          />
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
              Contact
            </h1>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-12"
          >
            <p
              className="text-[clamp(1.9rem,5vw,3.4rem)] font-black text-black leading-tight max-w-2xl"
              style={{ fontFamily: sans, letterSpacing: '-0.025em' }}
            >
              Got a project?{' '}
              <span className="text-black/30">I want to hear it.</span>
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <motion.a
                href={`mailto:${EMAIL}`}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(0,0,0,0.85)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white text-[14px] font-semibold cursor-pointer"
                style={{ backgroundColor: 'rgba(0,0,0,1)', fontFamily: sans }}
              >
                Say hi — {EMAIL}
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
                  →
                </motion.span>
              </motion.a>

              <motion.button
                onClick={copyEmail}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(0,0,0,0.05)' }}
                whileTap={{ scale: 0.97 }}
                className="relative inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-[13px] cursor-pointer border border-black/18 text-black/65 hover:text-black overflow-hidden"
                style={{ fontFamily: mono }}
              >
                <motion.span
                  animate={{ opacity: copied ? 0 : 1, y: copied ? -14 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Copy email
                </motion.span>
                <motion.span
                  animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : 14 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  Copied ✓
                </motion.span>
              </motion.button>

              <span
                className="text-[10px] text-black/25 tracking-[0.15em] uppercase hidden sm:inline-block"
                style={{ fontFamily: mono }}
              >
                press "C" to copy
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span
                className="text-[10px] text-black/30 tracking-[0.3em] uppercase block mb-4"
                style={{ fontFamily: mono }}
              >
                Elsewhere
              </span>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)', scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="text-[12px] text-black/65 hover:text-black border border-black/18 rounded-full px-4 py-2 transition-colors"
                    style={{ fontFamily: mono, letterSpacing: '0.05em' }}
                  >
                    {s.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Mobile-only illustration — inline below content so it never overlaps */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center pt-4 md:hidden"
            >
              <img
                src={contactIllustration}
                alt=""
                aria-hidden
                className="pointer-events-none select-none"
                style={{
                  height: 'clamp(180px, 55vw, 280px)',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.1))',
                }}
              />
            </motion.div>
          </motion.div>
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
