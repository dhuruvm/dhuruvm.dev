import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { DevScene, type DevCallbacks } from './DevScene';

interface Props {
  onRepoEnter: (idx: number) => void;
  onRepoLeave: () => void;
  onEnd: () => void;
  onBack: () => void;
  tLeft: boolean;
  tRight: boolean;
  tJump: boolean;
}

export default function DevPhaserGame({
  onRepoEnter, onRepoLeave, onEnd, onBack, tLeft, tRight, tJump,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef     = useRef<DevScene | null>(null);

  useEffect(() => {
    const cb: DevCallbacks = { onRepoEnter, onRepoLeave, onEnd, onBack };
    const scene = new DevScene(cb);
    sceneRef.current = scene;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current!,
      backgroundColor: '#ffffff',
      antialias: false,
      roundPixels: false,
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
