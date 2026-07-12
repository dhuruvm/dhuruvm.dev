import { useEffect } from 'react';

const ALL_TABS = ['overview', 'repos', 'projects', 'packages', 'stars'];

interface GameOverlayProps {
  state: 'gameover' | 'win';
  score: number;
  highScore: number;
  visitedTabs: Set<string>;
  onReplay: () => void;
}

export const GameOverlay = ({ state, score, highScore, visitedTabs, onReplay }: GameOverlayProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); onReplay(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onReplay]);

  const isWin = state === 'win';

  return (
    <div className={`game-overlay ${isWin ? 'game-overlay-win' : 'game-overlay-gameover'}`}>
      <div className="overlay-card">
        <div className="overlay-icon">{isWin ? '🏆' : '💀'}</div>
        <h2 className="overlay-title">{isWin ? 'PROFILE CLEARED!' : 'GAME OVER'}</h2>
        <p className="overlay-subtitle">
          {isWin ? 'You explored the entire GitHub world!' : 'Better luck next time, explorer.'}
        </p>

        <div className="overlay-scores">
          <div className="overlay-score-block">
            <span className="overlay-score-label">SCORE</span>
            <span className="overlay-score-value">{score.toLocaleString()}</span>
          </div>
          <div className="overlay-score-divider" />
          <div className="overlay-score-block">
            <span className="overlay-score-label">BEST</span>
            <span className="overlay-score-value">{Math.max(score, highScore).toLocaleString()}</span>
          </div>
        </div>

        <div className="overlay-tabs-grid">
          {ALL_TABS.map(tab => {
            const visited = visitedTabs.has(tab);
            return (
              <div key={tab} className={`overlay-tab-item ${visited ? 'visited' : ''}`}>
                <span>{visited ? '✅' : '⬜'}</span>
                <span className="overlay-tab-name">{tab}</span>
              </div>
            );
          })}
        </div>

        <button className={`overlay-btn ${isWin ? 'overlay-btn-win' : 'overlay-btn-gameover'}`} onClick={onReplay}>
          ▶&nbsp;&nbsp;{isWin ? 'PLAY AGAIN' : 'TRY AGAIN'}
        </button>

        <p className="overlay-hint">Press Space or Enter to restart</p>
      </div>
    </div>
  );
};
