import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './App.css';

import { useGitHubData } from './hooks/useGitHubData';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { SplashScreen } from './components/SplashScreen';
import { GameHUD } from './components/GameHUD';
import { GameOverlay } from './components/GameOverlay';
import { measureWorld } from './game/measurePlatforms';
import { createVirtualInput } from './game/types';
import { sound } from './game/SoundManager';
import type { MeasuredWorld, PlatformDef } from './game/types';

import { Navbar } from './components/Layout/Navbar';
import { ProfileSidebar } from './components/Profile/ProfileSidebar';
import { Overview } from './components/Tabs/Overview';
import { RepositoryList } from './components/Tabs/RepositoryList';
import { Projects } from './components/Tabs/Projects';
import { Packages } from './components/Tabs/Packages';
import { Stars } from './components/Tabs/Stars';

const USERNAME = new URLSearchParams(window.location.search).get('user') || 'dhuruvm';
const EMPTY_WORLD: MeasuredWorld = { width: 0, height: 0, platforms: [] };
const MAX_LIVES = 3;
const TOTAL_TABS = 5;

type GameState = 'splash' | 'playing' | 'gameover' | 'win';

type ScorePopup = { id: number; amount: number; big: boolean };

function PlatformerApp() {
  const { profile, repos, contributions, loading, error } = useGitHubData(USERNAME);

  // ─── Game State ────────────────────────────────────────────────────────────
  const [gameState, setGameState] = useState<GameState>('splash');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set(['overview']));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs to avoid stale closures in game callbacks
  const scoreRef = useRef(0);
  const visitedTabsRef = useRef<Set<string>>(new Set(['overview']));
  useEffect(() => { scoreRef.current = score; }, [score]);

  // ─── UI State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [world, setWorld] = useState<MeasuredWorld>(EMPTY_WORLD);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [jigglingPlatform, setJigglingPlatform] = useState<string | null>(null);
  const [nearestPlatformId, setNearestPlatformId] = useState<string | null>(null);
  const [standingPlatformId, setStandingPlatformId] = useState<string | null>(null);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const [hudTop, setHudTop] = useState(76);

  // ─── Refs ──────────────────────────────────────────────────────────────────
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const navWrapRef = useRef<HTMLDivElement>(null);
  const popupIdRef = useRef(0);
  const toastTimer = useRef<number | null>(null);
  const jiggleTimer = useRef<number | null>(null);
  const virtualInput = useRef(createVirtualInput()).current;

  // ─── Sound sync ────────────────────────────────────────────────────────────
  useEffect(() => { sound.setEnabled(soundEnabled); }, [soundEnabled]);

  // ─── Responsive ────────────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ─── Platform glow: approaching / can interact ────────────────────────────
  useEffect(() => {
    const prev = worldRef.current?.querySelector<HTMLElement>('.platform-near');
    prev?.classList.remove('platform-near');
    if (nearestPlatformId && worldRef.current) {
      worldRef.current
        .querySelector<HTMLElement>(`[data-platform-id="${nearestPlatformId}"]`)
        ?.classList.add('platform-near');
    }
  }, [nearestPlatformId]);

  // ─── Platform highlight: currently standing on ────────────────────────────
  useEffect(() => {
    const prev = worldRef.current?.querySelector<HTMLElement>('.platform-standing');
    prev?.classList.remove('platform-standing');
    if (standingPlatformId && worldRef.current) {
      worldRef.current
        .querySelector<HTMLElement>(`[data-platform-id="${standingPlatformId}"]`)
        ?.classList.add('platform-standing');
    }
  }, [standingPlatformId]);

  // ─── World measurement ─────────────────────────────────────────────────────
  const remeasurePending = useRef(false);
  const remeasure = useCallback(() => {
    if (!worldRef.current || remeasurePending.current) return;
    remeasurePending.current = true;
    requestAnimationFrame(() => {
      remeasurePending.current = false;
      if (worldRef.current) setWorld(measureWorld(worldRef.current));
    });
  }, []);

  useLayoutEffect(() => {
    if (loading || !worldRef.current) return;
    remeasure();
    const observer = new ResizeObserver(() => remeasure());
    observer.observe(worldRef.current);
    window.addEventListener('resize', remeasure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', remeasure);
    };
  }, [loading, activeTab, profile, repos, contributions, remeasure]);

  // Keep HUD pinned below nav
  useLayoutEffect(() => {
    if (loading || !navWrapRef.current) return;
    const el = navWrapRef.current;
    const update = () => setHudTop(el.getBoundingClientRect().height + 12);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, isMobile]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const addScorePopup = useCallback((amount: number, big = false) => {
    const id = ++popupIdRef.current;
    setScorePopups(prev => [...prev, { id, amount, big }]);
    window.setTimeout(() => setScorePopups(prev => prev.filter(p => p.id !== id)), 1200);
  }, []);

  // ─── Game Flow ─────────────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    visitedTabsRef.current = new Set(['overview']);
    setVisitedTabs(new Set(['overview']));
    scoreRef.current = 0;
    setScore(0);
    setLives(MAX_LIVES);
    setActiveTab(undefined);
    setPrompt(null);
    setNearestPlatformId(null);
    setScorePopups([]);
    setGameState('playing');
  }, []);

  const handleReplay = useCallback(() => {
    setHighScore(prev => Math.max(prev, scoreRef.current));
    handleStart();
  }, [handleStart]);

  // ─── Game Callbacks (called from Phaser scene) ─────────────────────────────
  const handleFall = useCallback(() => {
    sound.death();
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) {
        setHighScore(hs => Math.max(hs, scoreRef.current));
        setGameState('gameover');
        return 0;
      }
      return next;
    });
  }, []);

  const handleJump = useCallback(() => {
    sound.jump();
  }, []);

  const handleLand = useCallback((platformId: string) => {
    sound.land();

    // Apply jiggle directly to the DOM element — covers ALL platform types
    // (repo cards, pinned repos, etc.) not just sidebar/pfp tracked via React state.
    const el = worldRef.current?.querySelector<HTMLElement>(`[data-platform-id="${platformId}"]`);
    if (el) {
      el.classList.remove('platform-jiggle');
      void el.offsetHeight; // force reflow so animation restarts from the beginning
      el.classList.add('platform-jiggle');
    }

    // Also update React state for ProfileSidebar compatibility
    setJigglingPlatform(platformId);
    if (jiggleTimer.current) window.clearTimeout(jiggleTimer.current);
    jiggleTimer.current = window.setTimeout(() => {
      setJigglingPlatform(null);
      el?.classList.remove('platform-jiggle');
    }, 480);
  }, []);

  const handleFirstVisit = useCallback((_platformId: string) => {
    sound.score();
    setScore(prev => prev + 25);
    addScorePopup(25);
  }, [addScorePopup]);

  const handleInteract = useCallback((platform: PlatformDef) => {
    sound.interact();
    if (platform.action === 'switch-tab') {
      const tabKey = platform.tabKey ?? 'overview';
      setActiveTab(tabKey || undefined);

      // Track new tab visits — use ref to avoid stale reads
      if (!visitedTabsRef.current.has(tabKey)) {
        visitedTabsRef.current = new Set([...visitedTabsRef.current, tabKey]);
        setVisitedTabs(new Set(visitedTabsRef.current));

        if (visitedTabsRef.current.size >= TOTAL_TABS) {
          // WIN — wait for tab content to render first
          addScorePopup(500, true);
          setScore(s => s + 500);
          window.setTimeout(() => {
            sound.win();
            setHighScore(hs => Math.max(hs, scoreRef.current));
            setGameState('win');
          }, 700);
        } else {
          sound.tabScore();
          setScore(s => s + 100);
          addScorePopup(100);
        }
      }
    } else if (platform.action === 'open-link' && platform.url) {
      window.open(platform.url, '_blank', 'noopener,noreferrer');
    } else if (platform.info) {
      showToast(platform.info);
    }
  }, [addScorePopup, showToast]);

  const handlePromptChange = useCallback((label: string | null, platformId: string | null) => {
    setPrompt(label);
    setNearestPlatformId(platformId);
  }, []);

  const handleStandPlatform = useCallback((platformId: string | null) => {
    setStandingPlatformId(platformId);
  }, []);

  // ─── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    if (jiggleTimer.current) window.clearTimeout(jiggleTimer.current);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) return <div className="loading">Loading {USERNAME}&apos;s Profile…</div>;
  if (error) return <div className="error">Error: {error}</div>;

  let content;
  if (activeTab === 'repos') content = <RepositoryList repos={repos} />;
  else if (activeTab === 'projects') content = <Projects username={USERNAME} />;
  else if (activeTab === 'packages') content = <Packages username={USERNAME} />;
  else if (activeTab === 'stars') content = <Stars username={USERNAME} />;
  else content = <Overview repos={repos} contributions={contributions} />;

  const isPlaying = gameState === 'playing';

  return (
    <div className="game-viewport" ref={viewportRef}>
      {/* ── Profile world (always rendered for platform measurement) ── */}
      <div className="game-world" ref={worldRef}>
        <div className={`container${isPlaying ? ' game-no-click' : ''}`}>
          <div ref={navWrapRef}>
            <Navbar
              username={USERNAME}
              activeTab={activeTab}
              profile={profile}
              repoCount={repos.length}
              onTabChange={setActiveTab}
            />
          </div>
          <div className="main-layout">
            <ProfileSidebar profile={profile} jigglingPlatform={jigglingPlatform} />
            <main className="content">{content}</main>
          </div>
        </div>

        {/* ── Phaser canvas — only mounted during active gameplay ── */}
        {isPlaying && world.width > 0 && viewportRef.current && (
          <GameCanvas
            world={world}
            scrollContainer={viewportRef.current}
            virtualInput={virtualInput}
            onInteract={handleInteract}
            onPromptChange={handlePromptChange}
            onLand={handleLand}
            onFall={handleFall}
            onJump={handleJump}
            onFirstVisit={handleFirstVisit}
            onStandPlatform={handleStandPlatform}
          />
        )}
      </div>

      {/* ── HUD + prompts (gameplay only) ── */}
      {isPlaying && (
        <>
          <GameHUD
            lives={lives}
            maxLives={MAX_LIVES}
            score={score}
            visitedTabs={visitedTabs}
            totalTabs={TOTAL_TABS}
            hudTop={hudTop}
            isMobile={isMobile}
          />

          {prompt && (
            <div className="game-prompt">
              <kbd className="gh-search-key">{isMobile ? 'tap' : 'E'}</kbd>
              <span>{prompt}</span>
            </div>
          )}

          {toast && <div className="game-toast">{toast}</div>}

          {/* Score popups */}
          {scorePopups.map(p => (
            <div key={p.id} className={`score-popup${p.big ? ' score-popup-big' : ''}`}>
              +{p.amount}
            </div>
          ))}

          {isMobile && <MobileControls input={virtualInput} />}
        </>
      )}

      {/* ── Overlays ── */}
      {gameState === 'splash' && (
        <SplashScreen
          profile={profile}
          onStart={handleStart}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(v => !v)}
          isMobile={isMobile}
        />
      )}

      {(gameState === 'gameover' || gameState === 'win') && (
        <GameOverlay
          state={gameState}
          score={score}
          highScore={highScore}
          visitedTabs={visitedTabs}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}

export default PlatformerApp;
