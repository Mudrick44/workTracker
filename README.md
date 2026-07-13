# Work Tracker

A tiny personal work-time tracker. Tap an NFC tag against your phone, it opens
a URL, and that URL toggles you between "working" and "not working" while
showing today's total hours.

Two endpoints:

- `GET /api/tap?key=SECRET` - the one the NFC tag opens. Toggles start/stop
  and shows today's total.
- `GET /api/history?key=SECRET` - a read-only list of past days, each
  expandable to show the raw start/stop timestamps logged that day. Linked
  from the bottom of the tap page, or bookmark it directly.

## How it works

- Every tap logs a `{ time, action }` entry ("start" or "stop") to a Redis
  list called `worklog`.
- The endpoint looks at the *last* entry to decide what the next one should
  be: no entry yet, or the last one was "stop" → log "start". Last one was
  "start" → log "stop".
- After logging, it adds up all complete start→stop pairs that happened
  today (Europe/Berlin time) and shows the total.
- `/api/history` reads the same log, groups it by day, and shows the last 14
  days that have any logged time. It never writes anything, so opening or
  reloading it is always safe (unlike `/api/tap`, which always toggles).
- If the `key` query param is missing or wrong on either endpoint, it just
  returns a plain "Not Found" page - no hint that anything special lives
  there.

## Setup

### 1. Create the Vercel project

1. Push this folder to a GitHub repo (or use the Vercel CLI directly).
2. Go to [vercel.com](https://vercel.com) → **Add New... → Project** → import
   the repo.
3. Framework preset: choose "Other" (this isn't a framework app, it's just an
   `/api` function). No build step is required.
4. Deploy.

### 2. Add Upstash Redis storage

1. In your Vercel project, open the **Storage** tab.
2. Choose **Upstash → Redis**, create a new database (or connect an existing
   one), and follow the prompts to link it to this project.
3. This automatically adds the Redis connection environment variables
   (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`) to your project,
   which is what `Redis.fromEnv()` in `api/tap.js` reads. You don't need to
   set these by hand.

### 3. Set your secret key

1. In the Vercel project, go to **Settings → Environment Variables**.
2. Add a variable named `WORK_TRACKER_SECRET` with a long, random value you
   choose yourself (e.g. generate one with `openssl rand -hex 16`).
3. Redeploy so the new environment variable is picked up (Vercel prompts you
   to redeploy after adding env vars, or you can trigger one manually).

### 4. Program your NFC tag

Write this URL to your NFC tag (any NFC-writing app, e.g. NFC Tools, works):

```
https://YOUR-PROJECT-NAME.vercel.app/api/tap?key=YOUR_SECRET_VALUE
```

Replace `YOUR-PROJECT-NAME` with your actual Vercel deployment domain and
`YOUR_SECRET_VALUE` with the same value you set for `WORK_TRACKER_SECRET`.

Tap the tag with your phone (NFC must be enabled) - it opens the URL in your
browser, toggles your work state, and shows a big, glanceable summary.

## Tweaking things yourself

- **Timezone**: change the `TIMEZONE` constant at the top of `api/tap.js`
  *and* `api/history.js` (uses standard IANA timezone names, e.g.
  `"America/New_York"`).
- **Colors / fonts shared by both pages**: edit `lib/theme.js`.
- **Tap page look**: edit `lib/page.js`.
- **History page look, or how many days it shows**: edit `lib/history-page.js`
  and the `DAYS_TO_SHOW` constant in `api/history.js`.
- **Data**: everything lives in one Redis list (`worklog`). You can inspect
  or clear it from the Upstash console if you ever want to reset your
  history.
