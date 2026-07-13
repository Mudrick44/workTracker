// api/tap.js
//
// One endpoint, one job: toggle between "working" and "not working" and show
// today's total worked time. Meant to be opened by an NFC tag (a plain GET
// request, e.g. https://your-app.vercel.app/api/tap?key=SECRET).

const { Redis } = require('@upstash/redis');
const { renderTapPage } = require('../lib/page');

// Change this if you ever need a different timezone.
const TIMEZONE = 'Europe/Berlin';

// Redis key holding the full history: a list of { time, action } entries.
const LOG_KEY = 'worklog';

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  const providedKey = req.query.key;
  const expectedKey = process.env.WORK_TRACKER_SECRET;

  // Wrong or missing key -> pretend this endpoint doesn't exist.
  if (!expectedKey || providedKey !== expectedKey) {
    res.status(404).send('Not Found');
    return;
  }

  // 1. Look at the last logged entry to decide what happens next.
  const history = (await redis.lrange(LOG_KEY, 0, -1)) || [];
  const lastEntry = history[history.length - 1];
  const nextAction = !lastEntry || lastEntry.action === 'stop' ? 'start' : 'stop';

  // 2. Log the new entry.
  const now = new Date();
  const newEntry = { time: now.toISOString(), action: nextAction };
  await redis.rpush(LOG_KEY, newEntry);
  history.push(newEntry);

  // 3. Work out how much time was worked today (in TIMEZONE).
  const totalMs = calculateTodayTotalMs(history);

  // 4. Render the result page.
  const html = renderTapPage({
    action: nextAction,
    timeStr: zonedTimeString(now),
    dateStr: zonedDateDisplay(now),
    totalStr: formatDuration(totalMs),
    key: providedKey,
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};

// Calendar date (YYYY-MM-DD) of an ISO timestamp, in TIMEZONE.
function zonedDateString(isoString) {
  return new Date(isoString).toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

// "HH:mm" of an ISO timestamp / Date, in TIMEZONE.
function zonedTimeString(dateOrIso) {
  return new Date(dateOrIso).toLocaleTimeString('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
}

// "Monday, 13 July" of a Date, in TIMEZONE - shown as a small footer.
function zonedDateDisplay(date) {
  return date.toLocaleDateString('en-GB', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// Sums every complete start -> stop pair whose start date matches "today"
// in TIMEZONE. A dangling, not-yet-stopped start is not counted.
function calculateTodayTotalMs(history) {
  const today = zonedDateString(new Date().toISOString());
  let totalMs = 0;

  for (let i = 0; i < history.length - 1; i++) {
    const current = history[i];
    const next = history[i + 1];

    if (current.action === 'start' && next.action === 'stop' && zonedDateString(current.time) === today) {
      totalMs += new Date(next.time) - new Date(current.time);
    }
  }

  return totalMs;
}

function formatDuration(ms) {
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}
