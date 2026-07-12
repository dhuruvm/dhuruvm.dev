import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/gameConfig';
import type { MainScene, MainSceneCallbacks } from '../game/MainScene';
import type { MeasuredWorld, PlatformDef, VirtualInput } from '../game/types';

interface GameCanvasProps {
  world: MeasuredWorld;
  scrollContainer: HTMLElement;
  virtualInput: VirtualInput;
  onInteract: (platform: PlatformDef) => void;
  onPromptChange: (label: string | null, platformId: string | null) => void;
  onLand: (platformId: string) => void;
  onFall: () => void;
  onJump: () => void;
  onFirstVisit: (platformId: string) => void;
  onStandPlatform: (platformId: string | null) => void;
}

export const GameCanvas = ({
  world, scrollContainer, virtualInput,
  onInteract, onPromptChange, onLand, onFall, onJump, onFirstVisit, onStandPlatform,
}: GameCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const callbacksRef = useRef<MainSceneCallbacks>({
    onInteract, onPromptChange, onLand, onFall, onJump, onFirstVisit, onStandPlatform,
  });
  const lastSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // Always keep latest callbacks (no stale closures)
  callbacksRef.current = { onInteract, onPromptChange, onLand, onFall, onJump, onFirstVisit, onStandPlatform };

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGameConfig(containerRef.current, world.width, world.height);
    const game = new Phaser.Game(config);
    gameRef.current = game;
    lastSize.current = { width: world.width, height: world.height };

    game.scene.start('main', {
      world,
      scrollContainer,
      virtualInput,
      callbacks: {
        onInteract: (p: PlatformDef) => callbacksRef.current.onInteract(p),
        onPromptChange: (l: string | null, id: string | null) => callbacksRef.current.onPromptChange(l, id),
        onLand: (id: string) => callbacksRef.current.onLand(id),
        onFall: () => callbacksRef.current.onFall(),
        onJump: () => callbacksRef.current.onJump(),
        onFirstVisit: (id: string) => callbacksRef.current.onFirstVisit(id),
        onStandPlatform: (id: string | null) => callbacksRef.current.onStandPlatform(id),
      },
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;
    const scene = game.scene.getScene('main') as MainScene | null;
    if (!scene || !scene.scene.isActive()) return;

    if (lastSize.current.width !== world.width || lastSize.current.height !== world.height) {
      lastSize.current = { width: world.width, height: world.height };
      game.scale.resize(world.width, world.height);
      scene.resizeWorld(world.width, world.height);
    }
    scene.applyPlatforms(world.platforms);
  }, [world]);

  return <div ref={containerRef} className="game-canvas-host" />;
};
