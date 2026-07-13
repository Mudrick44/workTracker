// api/history.js
//
// Read-only view of past days: GET /api/history?key=SECRET
// Unlike /api/tap, visiting (or reloading) this page never changes any
// data - it only reads the log and groups it by day.

const { Redis } = require('@upstash/redis');
const { renderHistoryPage } = require('../lib/history-page');

// Keep in sync with the constant in api/tap.js if you change it.
const TIMEZONE = 'Europe/Berlin';

const LOG_KEY = 'worklog';

// How many past days (with logged time) to show at most.
const DAYS_TO_SHOW = 14;

// Vercel's Upstash marketplace integration names these KV_REST_API_URL /
// KV_REST_API_TOKEN (not the UPSTASH_REDIS_REST_* names Redis.fromEnv()
// expects), so we build the client explicitly instead.
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  const providedKey = req.query.key;
  const expectedKey = process.env.WORK_TRACKER_SECRET;

  if (!expectedKey || providedKey !== expectedKey) {
    res.status(404).send('Not Found');
    return;
  }

  const history = (await redis.lrange(LOG_KEY, 0, -1)) || [];
  const days = groupByDay(history).slice(-DAYS_TO_SHOW).reverse();

  const html = renderHistoryPage({ days });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};

// Calendar date (YYYY-MM-DD) of an ISO timestamp, in TIMEZONE.
function zonedDateKey(isoString) {
  return new Date(isoString).toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

// "HH:mm" of an ISO timestamp, in TIMEZONE.
function zonedTimeString(isoString) {
  return new Date(isoString).toLocaleTimeString('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

// "Today", "Yesterday", or e.g. "Monday, 7 July" for a YYYY-MM-DD key.
function dayLabel(dateKey) {
  const today = zonedDateKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = zonedDateKey(yesterdayDate.toISOString());

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  // Noon avoids the date rolling backwards/forwards near a DST boundary.
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// Groups the flat log into one entry per day, each with its raw
// start/stop entries and the total of its complete start->stop pairs.
// Returned oldest-first.
function groupByDay(history) {
  const byDate = new Map();

  for (const entry of history) {
    const dateKey = zonedDateKey(entry.time);
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { entries: [], totalMs: 0 });
    }
    byDate.get(dateKey).entries.push(entry);
  }

  for (let i = 0; i < history.length - 1; i++) {
    const current = history[i];
    const next = history[i + 1];
    if (current.action === 'start' && next.action === 'stop') {
      const dateKey = zonedDateKey(current.time);
      byDate.get(dateKey).totalMs += new Date(next.time) - new Date(current.time);
    }
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, data]) => ({
      label: dayLabel(dateKey),
      totalStr: formatDuration(data.totalMs),
      entries: data.entries.map((entry) => ({
        action: entry.action,
        timeStr: zonedTimeString(entry.time),
      })),
    }));
}
