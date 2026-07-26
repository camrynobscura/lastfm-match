// Renders design/og.html to public/og.png at exactly 1200x630.
//
//   npm run og
//
// Uses the Chrome already installed on the machine (channel: 'chrome')
// rather than downloading a browser, which is why the dependency is
// playwright-core and not playwright.

import { chromium } from 'playwright-core'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, 'og.html')
const output = resolve(here, '..', 'public', 'og.png')

// the OG standard: 1.91:1. deviceScaleFactor 1 so the PNG is exactly this
// many pixels rather than a retina multiple
const WIDTH = 1200
const HEIGHT = 630

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
})

await page.goto(`file://${source}`, { waitUntil: 'networkidle' })
// without this the screenshot can catch a fallback face mid-swap
await page.evaluate(() => document.fonts.ready)

await page.screenshot({ path: output })
await browser.close()

console.log(`og.png written — ${WIDTH}x${HEIGHT}`)
