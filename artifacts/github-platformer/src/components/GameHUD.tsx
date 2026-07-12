interface GameHUDProps {
  lives: number;
  maxLives: number;
  score: number;
  visitedTabs: Set<string>;
  totalTabs: number;
  hudTop: number;
  isMobile: boolean;
}

export const GameHUD = ({ lives, maxLives, score, visitedTabs, totalTabs, hudTop, isMobile }: GameHUDProps) => {
  const progress = Math.round((visitedTabs.size / totalTabs) * 100);

  return (
    <div className="game-hud-bar" style={{ top: hudTop }}>
      <div className="hud-lives" aria-label={`${lives} lives remaining`}>
        {Array.from({ length: maxLives }, (_, i) => (
          <span key={i} className={i < lives ? 'hud-heart-full' : 'hud-heart-empty'}>
            {i < lives ? '❤️' : '🖤'}
          </span>
        ))}
      </div>

      <div className="hud-divider" />

      <div className="hud-score">
        <span className="hud-label">SCORE</span>
        <span className="hud-value">{score.toLocaleString()}</span>
      </div>

      <div className="hud-divider" />

      <div className="hud-progress-wrap">
        <span className="hud-label">{isMobile ? '' : 'EXPLORE '}{progress}%</span>
        <div className="hud-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="hud-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};
