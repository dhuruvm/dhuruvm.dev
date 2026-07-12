import Phaser from 'phaser';
import { MainScene } from './MainScene';

export function createGameConfig(parent: HTMLElement, width: number, height: number): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    transparent: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 900 },
        debug: false,
      },
    },
    scene: [MainScene],
    banner: false,
  };
}
