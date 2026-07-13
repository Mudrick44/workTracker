// lib/history-page.js
//
// Renders the history view: a list of past days, each expandable to show
// the raw start/stop timestamps logged that day. Read-only page (unlike
// the tap endpoint, visiting/reloading this never changes any data).

const { ROOT_TOKENS, BASE_STYLES, playIcon, pauseIcon } = require('./theme');

function renderHistoryPage({ days }) {
  const body = days.length
    ? days.map((day, i) => renderDay(day, i === 0)).join('')
    : '<p class="empty">No taps logged yet.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<title>Work Tracker - History</title>
<style>${STYLES}</style>
</head>
<body>
  <h1 class="title">History</h1>
  <p class="subtitle">Last ${days.length} day${days.length === 1 ? '' : 's'} with logged time</p>

  <div class="list">
    ${body}
  </div>
</body>
</html>`;
}

function renderDay(day, isMostRecent) {
  const entries = day.entries
    .map(
      (entry) => `
      <div class="entry-row">
        <span class="entry-icon" data-state="${entry.action === 'start' ? 'working' : 'resting'}">
          ${entry.action === 'start' ? playIcon(11) : pauseIcon(11)}
        </span>
        <span class="entry-label">${entry.action === 'start' ? 'Started' : 'Stopped'}</span>
        <span class="entry-time">${entry.timeStr}</span>
      </div>`
    )
    .join('');

  return `
    <details class="day"${isMostRecent ? ' open' : ''}>
      <summary>
        <span class="day-date">${day.label}</span>
        <span class="day-total">${day.totalStr}</span>
        <span class="chevron" aria-hidden="true"></span>
      </summary>
      <div class="day-entries">${entries}</div>
    </details>`;
}

const STYLES = `
  ${ROOT_TOKENS}
  ${BASE_STYLES}

  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: max(48px, env(safe-area-inset-top));
  }

  .title {
    margin: 0 0 4px;
    font-size: clamp(1.75rem, 6vw, 2.1rem);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }

  .subtitle {
    margin: 0 0 24px;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .list {
    width: min(92vw, 460px);
    border-radius: 20px;
    overflow: hidden;
    background: var(--card-bg);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    backdrop-filter: blur(24px) saturate(180%);
    box-shadow: var(--card-shadow);
    border: 1px solid var(--card-border);
  }

  .empty {
    padding: 32px 20px;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }

  .day { border-bottom: 1px solid var(--separator); }
  .day:last-of-type { border-bottom: none; }

  .day summary {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .day summary::-webkit-details-marker { display: none; }

  .day summary:active { background: var(--row-active); }

  .day-date {
    flex: 1;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .day-total {
    font-size: 0.95rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-secondary);
  }

  .chevron {
    width: 8px;
    height: 8px;
    border-right: 2px solid var(--text-tertiary);
    border-bottom: 2px solid var(--text-tertiary);
    transform: rotate(-45deg);
    transition: transform 0.25s ease;
    margin-left: 2px;
  }

  .day[open] .chevron { transform: rotate(45deg); }

  .day-entries {
    padding: 4px 20px 16px 20px;
  }

  .entry-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
  }

  .entry-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .entry-icon[data-state="working"] { background: var(--blue); }
  .entry-icon[data-state="resting"] { background: var(--gray); }

  .entry-label {
    flex: 1;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .entry-time {
    font-size: 0.9rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }
`;

module.exports = { renderHistoryPage };
