import type { MeasuredWorld, PlatformDef, PlatformAction } from './types';

/**
 * Measures every element tagged with `data-platform-id` inside `worldEl` and
 * returns their position/size relative to `worldEl`'s content box (not the
 * viewport), so coordinates stay stable regardless of page scroll.
 *
 * This lets the Phaser physics world attach invisible collision bodies that
 * exactly match the real, rendered GitHub-clone DOM — no re-drawing of UI.
 */
export function measureWorld(worldEl: HTMLElement): MeasuredWorld {
  const worldRect = worldEl.getBoundingClientRect();
  const nodes = worldEl.querySelectorAll<HTMLElement>('[data-platform-id]');

  const platforms: PlatformDef[] = [];
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const id = node.dataset.platformId!;
    const action = (node.dataset.platformAction as PlatformAction) || 'info';
    const label = node.dataset.platformLabel || id;
    const tabKey = node.dataset.platformTabkey;
    const url = node.dataset.platformUrl;
    const info = node.dataset.platformInfo;

    platforms.push({
      id,
      x: rect.left - worldRect.left,
      y: rect.top - worldRect.top,
      width: rect.width,
      height: rect.height,
      label,
      action,
      tabKey,
      url,
      info,
    });
  });

  return {
    width: worldEl.scrollWidth,
    height: worldEl.scrollHeight,
    platforms,
  };
}
