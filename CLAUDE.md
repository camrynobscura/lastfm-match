# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Last.fm Match is a React + Vite single-page app that compares two Last.fm users' listening history and computes a "music compatibility" score, plus lists of shared artists/tracks. It calls the public Last.fm API directly from the browser (no backend).

## Commands

- `npm run dev` — start the Vite dev server with HMR.
- `npm run build` — production build.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint over the project.
- `npm test` — run the Vitest suite (currently covers `src/lib/*` only — the
  pure scoring/error-mapping logic, not components).

## Environment variables

Requires a `.env` file (not committed) with:
- `VITE_REACT_APP_LASTFM_API_KEY` — Last.fm API key, used in `src/services/api.js`.
- `VITE_USERNAME_ONE` / `VITE_USERNAME_TWO` — default usernames pre-filled into the form in `src/components/Home.jsx`, useful for local dev so you don't retype usernames each reload.

## Architecture

- `src/services/api.js` — thin fetch wrappers around the Last.fm API (`user.gettopartists`, `user.gettoptracks`), returning raw parsed JSON responses.
- `src/lib/compatibility.js` — pure, unit-tested scoring functions: `toPlaycountMap` (item list → `{ name: playcount }` map; tracks are keyed as `"Artist :: Track"`), `getScore` (for shared items, sums `min(shareOfListeningA, shareOfListeningB)` — a "boost" score, not Jaccard, so scores aren't dragged down by each person's total library size), `getShared` (ranked shared-item list), and `musicCompatibility` (combines artist score at 60% weight and track score at 40% weight, since track overlap is rarer, then stretches the result via a fourth root into a friendlier 0-100 range).
- `src/lib/lastfmErrors.js` — `describeUserError`: maps the Last.fm API's error-shaped success responses (HTTP 200 with an `error`/`message` field in the body — checked via `data.artists.error`/`data.tracks.error` rather than HTTP status) to friendly copy, naming the specific bad username for a "not found" (code 6) error.
- `src/hooks/useMatchComparison.js` — `useMemo`-based hook wrapping the two lib modules above: given both users' fetched data, returns `{ score, sharedArtists, sharedTracks, error, invalidField }` in one synchronous pass (no intermediate render where the shared lists lag behind the score).
- `src/components/Home.jsx` — owns form state, fetching, and orchestration:
  - Form state for the two usernames and the time period (`7day` / `1month` / `3month` / `6month` / `12month` / `overall`, mapped to Last.fm's `period` param).
  - On submit, fetches top artists + top tracks for both users into `usernameOneData`/`usernameTwoData`, which feed `useMatchComparison`.
  - `submitError`/`submitInvalidField` state covers errors set directly by `handleSubmit` (empty fields, network/generic fetch failures) that aren't derivable from the fetched data; these are combined with the hook's derived `error`/`invalidField` (submit-time error takes precedence).
  - Two scroll-into-view effects: one nudges the loading box into view when a search starts, the other scrolls the shared-artists panel into view once results land.
- `src/components/MatchDescription.jsx` — renders the compatibility result (score ring + prose); branches on whether shared artists/tracks exist (both / artists-only / tracks-only / neither) to pick which sub-copy and components to show.
- `src/components/CommonArtistsDescription.jsx` / `CommonTracksDescription.jsx` — render the truncated (top 5 artists / top 3 tracks) shared-item lists as prose sentences.
- `src/components/MatchTable.jsx` — renders the full shared-artists/shared-tracks bar-chart comparison tables (paginated, 10 items per page with a "see more" button), rendered twice from `Home.jsx` (once per list).
- `src/components/ErrorMessage.jsx` / `src/components/DownArrow.jsx` — the error box and the animated section-connector arrows.

## Known issues to be aware of

- `src/services/api.js` calls the Last.fm API over plain `http://`.
