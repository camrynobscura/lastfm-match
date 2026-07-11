---
name: verify
description: How to run and verify the Last.fm Match app end-to-end in this repo
---

# Verifying Last.fm Match

## Build/run gotchas

- System Node at `/usr/local/bin/node` is v17 — too old for Vite 7 / ESLint 9.
  Prefix with nvm's Node: `export PATH="$HOME/.nvm/versions/node/v26.5.0/bin:$PATH"`
  (check `ls ~/.nvm/versions/node` for the current version).
- Dev server: `npm run dev -- --port <port>` (background it; ready in <1s).
- `.env` pre-fills both username inputs, so a submit works with no typing.

## Driving the UI

- Use headless **Chrome** via playwright-core (`channel: 'chrome'`). Never use
  Firefox (user rule). Install `playwright-core` in the scratchpad, not the repo.
- Flow: goto page → `input[placeholder="Username 1"]` / `"Username 2"` →
  `selectOption('select', period)` → click `button[type=submit]` → wait for the
  "data is being loaded" text to appear then disappear (fixed sleeps are flaky:
  slow API responses bleed one scenario's result into the next capture) → read
  `.match-description` text / screenshot.
- Useful probes: same username twice ⇒ 100% score; invalid username ⇒
  "User not found" error text replaces results; changing period ⇒ score changes.
- The Last.fm API is called live (public, read-only) with the key from `.env`.

## Pre-existing quirks (don't flag as regressions)

- `MatchTable.jsx` is a stub that renders "hello" below the form after submit.
- `npm run lint` has 3 pre-existing no-unused-vars errors in MatchTable.jsx.
