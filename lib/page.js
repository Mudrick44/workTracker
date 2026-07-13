// lib/page.js
//
// Renders the result page shown right after a tap. Kept in its own file
// (separate from the Redis/date logic in api/tap.js) so the look of the
// page can be changed without touching how it's calculated.
//
// Design: modeled on Apple's own "glance" cards (Health/Fitness summaries,
// Music play/pause) - system font, system colors, frosted glass, no
// gradients. Green badge = working, gray badge = resting.

function renderTapPage({ action, timeStr, dateStr, totalStr }) {
  const isWorking = action === 'start';
  const headline = isWorking ? 'Working' : 'Not working';
  const subline = isWorking ? `Started at ${timeStr}` : `Stopped at ${timeStr}`;
  const icon = isWorking ? PLAY_ICON : PAUSE_ICON;
  const state = isWorking ? 'working' : 'resting';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<title>Work Tracker</title>
<style>${STYLES}</style>
</head>
<body>
  <main class="card" data-state="${state}">
    <div class="badge">
      <span class="badge-pulse" aria-hidden="true"></span>
      <span class="badge-icon" aria-hidden="true">${icon}</span>
    </div>

    <h1 class="headline">${headline}</h1>
    <p class="subline">${subline}</p>

    <div class="divider" role="separator"></div>

    <p class="eyebrow">Total today</p>
    <p class="total">${totalStr}</p>

    <p class="footer">${dateStr}</p>
  </main>
</body>
</html>`;
}

// Minimal inline glyphs (no icon font / external requests needed).
const PLAY_ICON = `<svg viewBox="0 0 24 24" width="30" height="30" fill="white"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>`;
const PAUSE_ICON = `<svg viewBox="0 0 24 24" width="28" height="28" fill="white"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>`;

const STYLES = `
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
    --green: #34C759;
    --green-glow: rgba(52, 199, 89, 0.35);
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
      --green: #30D158;
      --green-glow: rgba(48, 209, 88, 0.35);
      --gray: #98989D;
      --gray-glow: rgba(152, 152, 157, 0.25);
    }
  }

  * { box-sizing: border-box; }

  html, body {
    height: 100%;
  }

  body {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right))
             max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
    background: var(--bg);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .card {
    width: min(92vw, 380px);
    padding: clamp(28px, 7vw, 40px) clamp(24px, 6vw, 32px) clamp(24px, 5vw, 32px);
    border-radius: 28px;
    background: var(--card-bg);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    backdrop-filter: blur(24px) saturate(180%);
    box-shadow: var(--card-shadow);
    border: 1px solid var(--card-border);
    text-align: center;
    animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .badge {
    position: relative;
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card[data-state="working"] .badge { background: var(--green); box-shadow: 0 10px 24px var(--green-glow); }
  .card[data-state="resting"] .badge { background: var(--gray); box-shadow: 0 10px 24px var(--gray-glow); }

  .badge-icon { display: flex; }

  .badge-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
  }

  .card[data-state="working"] .badge-pulse {
    background: var(--green);
    animation: pulse 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  .headline {
    margin: 0 0 4px;
    font-size: clamp(1.5rem, 5vw, 1.75rem);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }

  .subline {
    margin: 0;
    font-size: clamp(0.95rem, 3vw, 1.05rem);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .divider {
    height: 1px;
    background: var(--separator);
    margin: clamp(20px, 5vw, 28px) 0;
  }

  .eyebrow {
    margin: 0 0 6px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .total {
    margin: 0;
    font-size: clamp(2.75rem, 13vw, 3.4rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }

  .footer {
    margin: clamp(16px, 4vw, 22px) 0 0;
    font-size: 0.8rem;
    color: var(--text-tertiary);
  }

  @keyframes rise {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes pulse {
    0% { opacity: 0.35; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.45); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card { animation: none; }
    .badge-pulse { animation: none; display: none; }
  }
`;

module.exports = { renderTapPage };
