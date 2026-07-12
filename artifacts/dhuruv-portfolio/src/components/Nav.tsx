import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import inkSplatterUrl from '@assets/ink-splatter.gif';

const mono = "'Space Mono', monospace";

const LINKS = [
  { label: 'Projects', path: '/projects' },
  { label: 'About',    path: '/about'    },
  { label: 'Contact',  path: '/contact'  },
];

const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Black circle expanding from top-left — used for all nav pill clicks
const CSS_CIRCLE_TL = `
  ::view-transition-group(root) { animation-duration: 0ms; }
  ::view-transition-image-pair(root) { background: #000; }
  ::view-transition-old(root) {
    animation: vt-old-tl 0.28s ease both;
    z-index: 0;
  }
  ::view-transition-new(root) {
    clip-path: circle(0% at 0% 0%);
    animation: vt-new-tl 0.65s ${EXPO} both;
    z-index: 1;
  }
  @keyframes vt-old-tl { to { opacity: 0; } }
  @keyframes vt-new-tl { to { clip-path: circle(150% at 0% 0%); } }
`;

// GIF ink-splatter from center — used for DM button back to home
const CSS_GIF_CENTER = `
  ::view-transition-group(root) { animation-duration: 0ms; }
  ::view-transition-image-pair(root) { background: #000; }
  ::view-transition-old(root) {
    animation: vt-old-gif 0.2s ease both;
    z-index: 0;
  }
  ::view-transition-new(root) {
    mask-image: url('${inkSplatterUrl}');
    mask-size: 0;
    mask-position: center;
    mask-repeat: no-repeat;
    animation: vt-gif-grow 1.6s ${EXPO} both;
    z-index: 1;
  }
  @keyframes vt-old-gif { to { opacity: 0; } }
  @keyframes vt-gif-grow { to { mask-size: 200vmax; } }
`;

// ─── Helper: inject CSS → startViewTransition → cleanup ────────
function vtNavigate(
  navigate : (path: string) => void,
  path     : string,
  css      : string,
) {
  const vt = (document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  }).startViewTransition;

  if (!vt) {
    navigate(path);
    return;
  }

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const transition = vt.call(document, () => navigate(path));
  transition.finished.finally(() => {
    if (style.parentNode) style.parentNode.removeChild(style);
  });
}

// ─── Component ─────────────────────────────────────────────────
export default function Nav() {
  const [location, navigate] = useLocation();
  const isHome = location === '/';

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-5 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4"
    >
      {/* DM pill — circle-from-center transition back to home */}
      {!isHome && (
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onClick={() => vtNavigate(navigate, '/', CSS_GIF_CENTER)}
          whileHover={{ scale: 1.06, backgroundColor: 'rgba(0,0,0,0.06)' }}
          whileTap={{ scale: 0.96 }}
          className="px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest text-black/60 hover:text-black transition-colors cursor-pointer mr-1"
          style={{
            border: '1px solid rgba(0,0,0,0.15)',
            backgroundColor: 'rgba(255,255,255,1)',
            fontFamily: mono,
          }}
        >
          DM
        </motion.button>
      )}

      {/* Nav pills — circle-from-top-left transition */}
      {LINKS.map((link) => {
        const active = location === link.path;
        return (
          <motion.button
            key={link.label}
            onClick={() => vtNavigate(navigate, link.path, CSS_GIF_CENTER)}
            animate={{
              scale: active ? [0.82, 1.08, 1] : 1,
              backgroundColor: active ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)',
              borderColor: active ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.18)',
              color: active ? '#fff' : 'rgba(0,0,0,0.75)',
            }}
            transition={{
              scale: { type: 'spring', stiffness: 300, damping: 18 },
              backgroundColor: { type: 'spring', stiffness: 300, damping: 18 },
              borderColor: { type: 'spring', stiffness: 300, damping: 18 },
              color: { duration: 0.08 },
            }}
            whileHover={{
              scale: 1.06,
              backgroundColor: active ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.06)',
            }}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-1.5 rounded-full text-[13px] font-medium tracking-wide cursor-pointer"
            style={{
              border: '1px solid transparent',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {link.label}
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
