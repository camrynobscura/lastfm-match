# Last.fm Match

Compare two Last.fm listeners and find out how much their music taste actually
overlaps — a compatibility score, plus every artist and track they share.

**[lastfm-match.netlify.app](https://lastfm-match.netlify.app/)**

![The form and a completed match, showing a 48% compatibility score and the artists both listeners have in common](docs/screenshot-match.png)

## How the compatibility score is computed

**Library size shouldn't be punished.** The obvious approach is Jaccard
similarity — shared items divided by total items. But someone with 2,000
scrobbled artists will score badly against a casual listener no matter how
much they genuinely have in common, because the denominator swamps the
overlap. So the score ignores library size entirely.

Instead, for each shared artist it takes **the smaller of the two people's
share of their own listening**:

```js
boost += Math.min(a[item] / totalA, b[item] / totalB)
```

Both people have to actually listen to something for it to count. If one
person plays an artist constantly and the other played them twice, it
contributes about as much as those two plays — which is the honest answer.

**Artists and tracks aren't equally meaningful.** Two people liking the same
artist is common; liking the same *specific track* is rarer and says more. But
because it's rarer, scoring on tracks alone produces depressingly low numbers.
The compromise is a weighted blend:

```js
const combined = artistScore * 0.6 + trackScore * 0.4
```

**Raw overlap scores are tiny.** Even a strong match lands somewhere around
0.05 on the raw scale, and telling two people they're "5% compatible" is
useless. A fourth root stretches the low end into a range that means something
to a human, without changing anyone's *relative* ranking:

```js
Math.round(Math.pow(combined, 1 / 4) * 100)
```

The shared lists are ranked the same way — by each person's share of listening,
not raw playcount — so one heavy listener can't dominate the ordering.

![The shared artists table, showing per-listener play counts as paired bars](docs/screenshot-shared-artists.png)

## Gotchas

- **Hiding the API key.** Last.fm needs a key, but this app has no backend of
  its own, so a single [Netlify Function](netlify/functions/lastfm.js) holds
  it. The browser only ever talks to that function, never Last.fm directly.
- **Rate limiting.** The function limits requests per IP, so no one can
  script a loop of requests straight at it.
- **Error passthrough.** Last.fm's own error messages (like "user not
  found") get forwarded untouched instead of a generic failure.
- **Edge caching.** Identical searches get cached at the edge instead of
  hitting Last.fm's API twice.
- **A CSP you can't test locally.** The security headers only apply on the
  real deploy, so production is the first place anything new meets them. The
  decorative wave under the title is an inline SVG data URI, which the
  original `img-src 'self'` blocked on sight — it shipped as a blank gap
  after passing every local check.

## Running it locally

```bash
npm install
cp .env.example .env     # then paste in your Last.fm API key
npm run dev              # http://localhost:8888
```

Grab a key from [Last.fm](https://www.last.fm/api/account/create). The
variable has no `VITE_` prefix on purpose, since Vite only inlines `VITE_*`
vars into the client bundle. Same variable goes in the Netlify UI under Site
configuration → Environment variables for deploys.

`npm run dev` runs Vite *and* the Netlify function together on one origin,
because the app is broken without the function — every search would 404.

| command | what it does |
| --- | --- |
| `npm run dev` | Vite + the function on one origin (:8888) |
| `npm run dev:vite` | Vite alone. Fine for styling, useless for anything that fetches |
| `npm run build` | production build |
| `npm run preview` | serve the production build |
| `npm test` | Vitest suite |
| `npm run lint` | ESLint |
| `npm run og` | re-render `public/og.png` from `design/og.html` |

Requires Node 20.19+ (Vite 7's floor).

## Testing

`npm test` covers `src/lib/` — the scoring math, error mapping, pagination and
URL building. That scope is deliberate: those are pure functions, so they test
in milliseconds without a browser, and they're where a bug would be both
likely and invisible. Components are verified by using the app.

## Accessibility

Audited against WCAG 2.1 AA and scores 100 in Lighthouse, including the
loading and results states an automated scan misses by default. Also covers
screen reader announcements, focus management on errors, and contrast tuned
for both light and dark surfaces.

## Built with

React 19, Vite 7, Sass, Vitest, and a Netlify Function. No component library,
no charting library — the bar charts, score ring and loading animation are all
hand-rolled CSS and SVG.

## Credits

Music data from the [Last.fm API](https://www.last.fm/api). Artist, track and
listener names link back to their Last.fm pages, per the
[API Terms of Service](https://www.last.fm/api/tos).

Built by [Camryn](https://www.camrynpearson.com/).

## License

[MIT](LICENSE). The licence covers this code only — music data remains subject
to Last.fm's own terms.
