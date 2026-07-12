import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene, type GameCallbacks, type GameStats } from './GameScene';

interface Props {
  onComplete: (stats: GameStats) => void;
  onBack: () => void;
  onFragmentCollect: (count: number) => void;
  tLeft: boolean;
  tRight: boolean;
  tJump: boolean;
}

export default function PhaserGame({
  onComplete, onBack, onFragmentCollect, tLeft, tRight, tJump,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef     = useRef<GameScene | null>(null);

  useEffect(() => {
    const cb: GameCallbacks = { onComplete, onBack, onFragmentCollect };
    const scene = new GameScene(cb);
    sceneRef.current = scene;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current!,
      backgroundColor: '#ffffff',
      antialias: true,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 1400 }, debug: false },
      },
      scene: [scene],
    };

    const game = new Phaser.Game(config);
    return () => { game.destroy(true); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.tLeft  = tLeft;
    s.tRight = tRight;
    s.tJump  = tJump;
  }, [tLeft, tRight, tJump]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, background: '#ffffff' }}
    />
  );
}
