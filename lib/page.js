// lib/page.js
//
// Renders the result page shown right after a tap. Kept in its own file
// (separate from the Redis/date logic in api/tap.js) so the look of the
// page can be changed without touching how it's calculated.
//
// Design: modeled on Apple's own "glance" cards (Health/Fitness summaries,
// Music play/pause) - system font, system colors, frosted glass, no
// gradients. Blue badge = working, gray badge = resting.

const { ROOT_TOKENS, BASE_STYLES, playIcon, pauseIcon } = require('./theme');

function renderTapPage({ action, timeStr, dateStr, totalStr, key }) {
  const isWorking = action === 'start';
  const headline = isWorking ? 'Working' : 'Not working';
  const subline = isWorking ? `Started at ${timeStr}` : `Stopped at ${timeStr}`;
  const icon = isWorking ? playIcon(30) : pauseIcon(28);
  const state = isWorking ? 'working' : 'resting';
  const historyUrl = `/api/history?key=${encodeURIComponent(key)}`;

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

  <a class="history-link" href="${historyUrl}">View history</a>
</body>
</html>`;
}

const STYLES = `
  ${ROOT_TOKENS}
  ${BASE_STYLES}

  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
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

  .card[data-state="working"] .badge { background: var(--blue); box-shadow: 0 10px 24px var(--blue-glow); }
  .card[data-state="resting"] .badge { background: var(--gray); box-shadow: 0 10px 24px var(--gray-glow); }

  .badge-icon { display: flex; }

  .badge-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
  }

  .card[data-state="working"] .badge-pulse {
    background: var(--blue);
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

  .history-link {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--blue);
    text-decoration: none;
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
