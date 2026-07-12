export type PlatformAction = 'switch-tab' | 'open-link' | 'info';

export interface PlatformDef {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  action: PlatformAction;
  tabKey?: string;
  url?: string;
  info?: string;
}

export interface MeasuredWorld {
  width: number;
  height: number;
  platforms: PlatformDef[];
}

/** Mutable, ref-held input state shared between the on-screen mobile controls and the game loop. */
export interface VirtualInput {
  left: boolean;
  right: boolean;
  run: boolean;
  /** Incremented on every jump tap so the scene can detect a fresh press (edge, not hold). */
  jumpTick: number;
  /** True while the jump button is physically held, for variable jump height. */
  jumpHeld: boolean;
  /** Incremented on every interact tap so the scene can detect a fresh press (edge, not hold). */
  interactTick: number;
}

export const createVirtualInput = (): VirtualInput => ({
  left: false,
  right: false,
  run: false,
  jumpTick: 0,
  jumpHeld: false,
  interactTick: 0,
});
