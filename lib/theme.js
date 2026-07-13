// lib/theme.js
//
// Design tokens shared by every page in lib/*.js (the tap result page and
// the history page). Keeping colors/fonts/icons here means both pages stay
// visually consistent, and a color change only has to happen once.
//
// Palette: real Apple system colors - systemBlue for "working", systemGray
// for "resting" (calm/neutral, not a warning color). No gradients.

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif';

// CSS custom properties, light mode + dark mode override.
const ROOT_TOKENS = `
  :root {
    color-scheme: light dark;
    --bg: #F2F2F7;
    --card-bg: rgba(255, 255, 255, 0.78);
    --card-border: rgba(0, 0, 0, 0.04);
    --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 20px 40px rgba(0, 0, 0, 0.08);
    --text-primary: #1C1C1E;
    --text-secondary: rgba(60, 60, 67, 0.6);
    --text-tertiary: rgba(60, 60, 67, 0.4);
    --separator: rgba(60, 60, 67, 0.22);
    --row-active: rgba(60, 60, 67, 0.06);
    --blue: #007AFF;
    --blue-glow: rgba(0, 122, 255, 0.35);
    --gray: #8E8E93;
    --gray-glow: rgba(142, 142, 147, 0.28);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #000000;
      --card-bg: rgba(28, 28, 30, 0.78);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 20px 50px rgba(0, 0, 0, 0.6);
      --text-primary: #F5F5F7;
      --text-secondary: rgba(235, 235, 245, 0.6);
      --text-tertiary: rgba(235, 235, 245, 0.4);
      --separator: rgba(84, 84, 88, 0.6);
      --row-active: rgba(235, 235, 245, 0.08);
      --blue: #0A84FF;
      --blue-glow: rgba(10, 132, 255, 0.35);
      --gray: #98989D;
      --gray-glow: rgba(152, 152, 157, 0.25);
    }
  }
`;

// Reset + page scaffolding shared by every page.
const BASE_STYLES = `
  * { box-sizing: border-box; }

  html, body { height: 100%; }

  body {
    margin: 0;
    min-height: 100vh;
    padding: max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right))
             max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
    background: var(--bg);
    font-family: ${FONT_STACK};
    -webkit-font-smoothing: antialiased;
  }
`;

// Minimal inline glyphs (no icon font / external requests needed).
// Sized on demand so the same glyph works both in a large state badge and
// a small history-row bullet.
const playIcon = (size = 30) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="white"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>`;
const pauseIcon = (size = 28) =>
  `<svg viewBox="0 0 24 24" width="${size * 0.93}" height="${size}" fill="white"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>`;

module.exports = { FONT_STACK, ROOT_TOKENS, BASE_STYLES, playIcon, pauseIcon };
