import { useRef } from 'react';
import type { VirtualInput } from '../game/types';

interface MobileControlsProps {
  input: VirtualInput;
}

export const MobileControls = ({ input }: MobileControlsProps) => {
  const runToggled = useRef(false);

  const setDir = (dir: 'left' | 'right', value: boolean) => {
    input[dir] = value;
  };

  const handleRunToggle = (el: HTMLButtonElement) => {
    runToggled.current = !runToggled.current;
    input.run = runToggled.current;
    el.classList.toggle('is-active', runToggled.current);
  };

  return (
    <div className="mobile-controls" onContextMenu={(e) => e.preventDefault()}>
      <div className="mc-group mc-dpad">
        <button
          type="button"
          className="mc-btn mc-btn-dir"
          aria-label="Move left"
          onPointerDown={(e) => { e.preventDefault(); setDir('left', true); }}
          onPointerUp={() => setDir('left', false)}
          onPointerLeave={() => setDir('left', false)}
          onPointerCancel={() => setDir('left', false)}
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 1 1 1.06 1.06L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" />
          </svg>
        </button>
        <button
          type="button"
          className="mc-btn mc-btn-dir"
          aria-label="Move right"
          onPointerDown={(e) => { e.preventDefault(); setDir('right', true); }}
          onPointerUp={() => setDir('right', false)}
          onPointerLeave={() => setDir('right', false)}
          onPointerCancel={() => setDir('right', false)}
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </div>

      <div className="mc-group mc-actions">
        <button
          type="button"
          className="mc-btn mc-btn-run"
          aria-label="Toggle run"
          onPointerDown={(e) => { e.preventDefault(); handleRunToggle(e.currentTarget); }}
        >
          Run
        </button>
        <button
          type="button"
          className="mc-btn mc-btn-jump"
          aria-label="Jump"
          onPointerDown={(e) => {
            e.preventDefault();
            input.jumpTick += 1;
            input.jumpHeld = true;
          }}
          onPointerUp={() => { input.jumpHeld = false; }}
          onPointerLeave={() => { input.jumpHeld = false; }}
          onPointerCancel={() => { input.jumpHeld = false; }}
        >
          <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 3.47a.75.75 0 0 1 .53.22l4.25 4.25a.75.75 0 1 1-1.06 1.06L8.75 6.03v6.22a.75.75 0 0 1-1.5 0V6.03L4.28 9a.75.75 0 0 1-1.06-1.06l4.25-4.25A.75.75 0 0 1 8 3.47Z" />
          </svg>
          <span className="mc-btn-label">Jump</span>
        </button>
        <button
          type="button"
          className="mc-btn mc-btn-interact"
          aria-label="Interact"
          onPointerDown={(e) => { e.preventDefault(); input.interactTick += 1; }}
        >
          <span>E</span>
          <span className="mc-btn-label">Act</span>
        </button>
      </div>
    </div>
  );
};
