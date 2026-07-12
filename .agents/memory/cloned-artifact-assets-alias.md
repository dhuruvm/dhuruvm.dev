---
name: Cloned react-vite artifact @assets alias
description: When importing a cloned repo's react-vite artifact, don't assume the @assets import alias points at the workspace-root attached_assets/ folder.
---

Some react-vite artifacts define the `@assets` Vite alias pointing at their own `src/assets/` directory instead of the workspace-root `attached_assets/` folder (which is the scaffold default convention). Grepping for the filenames referenced via `@assets/...` in root `attached_assets/` can give a false negative even though the app builds fine.

**Why:** Wasted time assuming a missing-asset problem when importing a cloned portfolio repo — the files existed under `src/assets/`, and the repo's `vite.config.ts` alias was already pointed there correctly.

**How to apply:** Before concluding assets are missing, always read the actual `resolve.alias['@assets']` line in the artifact's `vite.config.ts` first, then check the directory it actually points to.
