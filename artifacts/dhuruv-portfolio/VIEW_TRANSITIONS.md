# View Transition Effects — Reference Doc

> Source: [theme-toggle.rdsx.dev](https://theme-toggle.rdsx.dev) by [@rudrodip](https://github.com/rudrodip/theme-toggle-effect)  
> All effects use the **View Transitions API** (`document.startViewTransition`)

---

## Core JavaScript (all effects share this)

```js
// Gate for browsers that don't support the API
if (!document.startViewTransition) {
  switchTheme();
} else {
  document.startViewTransition(switchTheme);
}
```

### Easing variable (used by all transitions)

```css
:root {
  --expo-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## How the pseudo-elements work

| Pseudo-element | Role |
|---|---|
| `::view-transition-group(root)` | Controls timing/easing of the whole transition |
| `::view-transition-new(root)` | The **incoming** (new theme) snapshot — animates on top |
| `::view-transition-old(root)` | The **outgoing** (old theme) snapshot — pushed behind |
| `.dark::view-transition-new(root)` | Targets the dark→light direction separately |

Set `z-index: -1` on `::view-transition-old` so the new view always animates on top.

---

## Transition 1 — `circle`

A plain SVG circle that expands from the center of the screen.

```css
::view-transition-new(root) {
  mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="white"/></svg>')
    center / 0 no-repeat;
  animation: scale 1s;
  animation-fill-mode: both;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  z-index: -1;
}

.dark::view-transition-new(root) {
  animation: scale 1s;
  animation-fill-mode: both;
}

@keyframes scale {
  to {
    mask-size: 200vmax;
  }
}
```

**How it works:** The SVG circle starts at `mask-size: 0` and grows to `200vmax`, revealing the new theme in a radial sweep from the center.

---

## Transition 2 — `circle-with-blur`

Same as `circle` but with a `feGaussianBlur` filter giving the circle's edge a soft glow — something `clip-path` cannot do.

```css
::view-transition-group(root) {
  animation-timing-function: var(--expo-out);
}

::view-transition-new(root) {
  mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>')
    center / 0 no-repeat;
  animation: scale 1s;
  animation-fill-mode: both;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  z-index: -1;
}

.dark::view-transition-new(root) {
  animation: scale 1s;
  animation-fill-mode: both;
}

@keyframes scale {
  to {
    mask-size: 200vmax;
  }
}
```

**Key difference from `circle`:** `feGaussianBlur stdDeviation="2"` is applied to the circle inside the SVG filter. `%23blur` is URL-encoded `#blur` to safely reference the filter inside a data URI.

---

## Transition 3 — `circle-blur-top-left`

Blurred circle expanding from the **top-left corner** instead of center. Feels like the toggle button itself is the origin.

```css
::view-transition-group(root) {
  animation-timing-function: var(--expo-out);
}

::view-transition-new(root) {
  mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="0" cy="0" r="18" fill="white" filter="url(%23blur)"/></svg>')
    top left / 0 no-repeat;
  animation: scale 1s;
  animation-fill-mode: both;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  z-index: -1;
}

.dark::view-transition-new(root) {
  animation: scale 1s;
  animation-fill-mode: both;
}

@keyframes scale {
  to {
    mask-size: 200vmax;
  }
}
```

**Key differences vs `circle-with-blur`:**

| Property | `circle-with-blur` | `circle-blur-top-left` |
|---|---|---|
| SVG circle center | `cx="20" cy="20"` | `cx="0" cy="0"` |
| Mask position | `center` | `top left` |

---

## Transition 4 — `polygon`

A diagonal triangular wipe sweeping from the top-left corner — like a page turn.

**The SVG mask (`polygon.svg` or inline):**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
     preserveAspectRatio="none">
  <polygon points="0,0 100,0 0,100" fill="white"/>
</svg>
```

```css
::view-transition-group(root) {
  animation-timing-function: var(--expo-out);
}

::view-transition-new(root) {
  mask: url('polygon.svg') top left / 0 no-repeat;
  mask-origin: top left;
  animation: scale 1.5s;
  animation-fill-mode: both;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: scale 1.5s;
  animation-fill-mode: both;
  z-index: -1;
  transform-origin: top left;
}

@keyframes scale {
  to {
    mask-size: 200vmax;
  }
}
```

**How it works:** A triangle polygon starts at size `0` from the top-left and expands to `200vmax`, creating a diagonal diagonal wipe that reveals the new theme.

---

## Transition 5 — `polygon-gradient`

Same diagonal wipe as `polygon` but with a **soft gradient edge** fading to transparent — achieved with `<linearGradient>` inside the SVG.

**The SVG mask (`polygon-gradient.svg` or inline):**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
     preserveAspectRatio="none">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="white" stop-opacity="1"/>
      <stop offset="80%"  stop-color="white" stop-opacity="1"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <polygon points="0,0 100,0 0,100" fill="url(#grad)"/>
</svg>
```

```css
::view-transition-group(root) {
  animation-timing-function: var(--expo-out);
}

::view-transition-new(root) {
  mask: url('polygon-gradient.svg') top left / 0 no-repeat;
  mask-origin: top left;
  animation: scale 1.5s;
  animation-fill-mode: both;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  z-index: -1;
}

.dark::view-transition-new(root) {
  animation: scale 1.5s;
  animation-fill-mode: both;
}

@keyframes scale {
  to {
    mask-size: 200vmax;
  }
}
```

**Key difference from `polygon`:** The `<linearGradient>` fades the trailing edge of the polygon from `stop-opacity="1"` → `stop-opacity="0"`, producing a feathered wipe instead of a hard edge.

---

## Transition 6 — `gif-1` (GIF as mask)

Any animated GIF is used as a CSS mask. The new theme is revealed **through the opaque parts** of the GIF. GIFs with transparent backgrounds produce the best masks.

```js
// JS — inject the GIF mask at runtime
function injectGifStyle(gifUrl) {
  const style = document.createElement('style');
  style.textContent = `
    ::view-transition-new(root) {
      mask: url('${gifUrl}') center / 0 no-repeat;
      mask-origin: center;
      animation: gif-scale 2s var(--expo-out);
      animation-fill-mode: both;
    }
    @keyframes gif-scale {
      to { mask-size: 200vmax; }
    }
  `;
  document.head.appendChild(style);
}
```

```css
/* Static CSS version */
::view-transition-new(root) {
  mask: url('your-animation.gif') center / 0 no-repeat;
  animation: gif-scale 2s var(--expo-out);
  animation-fill-mode: both;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  z-index: -1;
}

.dark::view-transition-new(root) {
  animation: gif-scale 2s var(--expo-out);
  animation-fill-mode: both;
}

@keyframes gif-scale {
  to {
    mask-size: 200vmax;
  }
}
```

**Tips:**
- Use a GIF with a **transparent/black background** — the opaque pixels define the reveal shape.
- Duration `2s` is longer to let the GIF animation play out fully during the mask expansion.
- Any GIF works — fire, splatter, ink bleed, glitch shapes, etc.

---

## Transition 7 — `gif-2` (GIF from corner)

Same GIF-as-mask technique but anchored to a **corner instead of center** — the GIF grows from the top-left, matching the polygon wipe origin.

```css
::view-transition-new(root) {
  mask: url('your-animation.gif') top left / 0 no-repeat;
  mask-origin: top left;
  animation: gif-scale 2s var(--expo-out);
  animation-fill-mode: both;
}

::view-transition-old(root),
.dark::view-transition-old(root) {
  animation: none;
  animation-fill-mode: both;
  z-index: -1;
}

.dark::view-transition-new(root) {
  animation: gif-scale 2s var(--expo-out);
  animation-fill-mode: both;
}

@keyframes gif-scale {
  to {
    mask-size: 200vmax;
  }
}
```

**Difference from `gif-1`:** `center` → `top left` for both `url(...)` position and `mask-origin`.

---

## Quick comparison table

| Name | Shape | Origin | Blur/Gradient | Duration |
|---|---|---|---|---|
| `circle` | Circle | Center | None | 1s |
| `circle-with-blur` | Circle | Center | Gaussian blur edge | 1s |
| `circle-blur-top-left` | Circle | Top-left | Gaussian blur edge | 1s |
| `polygon` | Triangle (diagonal wipe) | Top-left | None (hard edge) | 1.5s |
| `polygon-gradient` | Triangle (diagonal wipe) | Top-left | Linear gradient edge | 1.5s |
| `gif-1` | Any GIF shape | Center | GIF defines shape | 2s |
| `gif-2` | Any GIF shape | Top-left | GIF defines shape | 2s |

---

## Browser support note

```js
// Always gate — older browsers skip the animation, theme still switches
if (!document.startViewTransition) {
  switchTheme();
  return;
}
document.startViewTransition(switchTheme);
```

- Chrome 111+ / Edge 111+ — full support
- Firefox / Safari — fallback (theme switches instantly, no animation)
- `200vmax` mask-size guarantees full coverage on any screen aspect ratio

---

## Using in React / Framer Motion projects

```tsx
function toggleTheme() {
  if (!document.startViewTransition) {
    document.documentElement.classList.toggle('dark');
    return;
  }
  document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark');
  });
}
```

Add the CSS of whichever transition you want to your global stylesheet, then call `toggleTheme()` from any button's `onClick`.
