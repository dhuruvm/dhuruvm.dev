import { useEffect } from 'react';
import type { GitHubProfile } from '../services/githubService';

interface SplashScreenProps {
  profile: GitHubProfile | null;
  onStart: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isMobile: boolean;
}

export const SplashScreen = ({ profile, onStart, soundEnabled, onToggleSound, isMobile }: SplashScreenProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onStart]);

  return (
    <div className="splash-overlay">
      <div className="splash-card">
        <div className="splash-logo">🎮</div>
        <h1 className="splash-title">GITHUB WORLD</h1>
        <p className="splash-subtitle">A platformer built from real GitHub profiles</p>

        {profile && (
          <div className="splash-profile">
            <img src={profile.avatar_url} alt={profile.login} className="splash-avatar" />
            <div>
              <div className="splash-display-name">{profile.name || profile.login}</div>
              <div className="splash-username">@{profile.login}</div>
            </div>
          </div>
        )}

        <div className="splash-objective">
          🏆 Visit all 5 tabs to win! Earn points by landing on new surfaces and interacting.
        </div>

        {!isMobile && (
          <div className="splash-controls">
            <div className="splash-control-item"><kbd>← →</kbd> Move</div>
            <div className="splash-control-item"><kbd>SHIFT</kbd> Run</div>
            <div className="splash-control-item"><kbd>SPACE</kbd> Jump</div>
            <div className="splash-control-item"><kbd>E</kbd> Interact</div>
          </div>
        )}
        {isMobile && (
          <div className="splash-mobile-hint">Use the on-screen controls to explore the world</div>
        )}

        <button className="splash-start-btn" onClick={onStart}>
          ▶&nbsp;&nbsp;{isMobile ? 'TAP TO START' : 'PRESS SPACE TO START'}
        </button>

        <button className="splash-sound-btn" onClick={onToggleSound}>
          {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
        </button>
      </div>
    </div>
  );
};
