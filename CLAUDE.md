# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Last.fm Match is a React + Vite single-page app that compares two Last.fm users' listening history and computes a "music compatibility" score, plus lists of shared artists/tracks. It calls the public Last.fm API directly from the browser (no backend).

## Commands

- `npm run dev` — start the Vite dev server with HMR.
- `npm run build` — production build.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run ESLint over the project.

There is no test suite configured in this repo.

## Environment variables

Requires a `.env` file (not committed) with:
- `VITE_REACT_APP_LASTFM_API_KEY` — Last.fm API key, used in `src/services/api.js`.
- `VITE_USERNAME_ONE` / `VITE_USERNAME_TWO` — default usernames pre-filled into the form in `src/components/Home.jsx`, useful for local dev so you don't retype usernames each reload.

## Architecture

- `src/services/api.js` — thin fetch wrappers around the Last.fm API (`user.gettopartists`, `user.gettoptracks`), returning raw parsed JSON responses.
- `src/components/Home.jsx` — owns all state and orchestration:
  - Form state for the two usernames and the time period (`7day` / `1month` / `3month` / `6month` / `12month` / `overall`, mapped to Last.fm's `period` param).
  - On submit, fetches top artists + top tracks for both users, then in a `useEffect` keyed on both users' data:
    - Converts each user's artist/track list into a `{ name: playcount }` map (tracks are keyed as `"Artist :: Track"`).
    - Computes a compatibility score via `musicCompatibility()`: for shared items, sums `min(shareOfListeningA, shareOfListeningB)` (a "boost" score, not Jaccard, so scores aren't dragged down by each person's total library size); combines artist score (60% weight) and track score (40% weight) since track overlap is rarer than artist overlap.
    - Stores `sharedArtists` / `sharedTracks` lists in state, passed down to display components.
  - Handles the Last.fm API's error-shaped success responses (HTTP 200 with an `error`/`message` field in the body, e.g. invalid username) by checking `data.artists.error` rather than HTTP status.
- `src/components/MatchDescription.jsx` — renders the compatibility result; branches on whether shared artists/tracks exist (both / artists-only / tracks-only / neither) to pick which sub-copy and components to show.
- `src/components/CommonArtistsDescription.jsx` / `CommonTracksDescription.jsx` — render the truncated (top 5 artists / top 3 tracks) shared-item lists as prose sentences.
- `src/components/MatchTable.jsx` — currently a stub.

## Known issues to be aware of

- `MatchDescription.jsx` currently hardcodes a "90% compatible" message instead of using the computed `result.score` from `Home.jsx`.
- In `Home.jsx`, `currentUserTwoTopTracks` is derived from `usernameOneData.tracks` instead of `usernameTwoData.tracks` — tracks end up compared against themselves rather than against user two's tracks.
- `src/services/api.js` calls the Last.fm API over plain `http://`.
