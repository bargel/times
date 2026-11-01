# PLUACAN

One moment in Vancouver, Kyiv and Warsaw, ready to paste into Discord. Live at <https://times.brgl.dev/>.

## Run it

Needs Node 22.

```sh
npm install
npm run dev        # dev server
npm test           # time logic and copy formats
npm run typecheck
npm run build      # into dist/
```

Or from the repo root with Docker: `make up`, then <http://localhost:5174>.

## Where things are

- `src/config/zones.ts`: the list of zones.
- `src/lib/time.ts`: all time zone arithmetic, with no Vue in it.
- `src/lib/share.ts`: the two copied formats. Their exact output is pinned in `share.test.ts`, because people paste it, so they are not translated.
- `src/lib/i18n.ts`: every word on the page in English, Ukrainian and Polish, chosen from the browser's languages.
- `src/composables/useTimeSelection.ts`: the one moment the page shows.
- `src/components/`: `DayLine` is the line, with `ZonePole` for each flag and `DayScene` for the picture. `MonthCalendar` picks the day where the screen has room for it, and `DayControls` where it does not.

## When a place changes its clocks

Offsets come from the time zone data on each device, so an older phone keeps following old rules. When a place changes its rules, add the change to `src/config/timeZoneRules.ts` with a test in `time.test.ts`. British Columbia's permanent UTC-7 is the first entry. The IANA [NEWS](https://data.iana.org/time-zones/tzdb/NEWS) file announces these changes.

## Add a zone

Add an entry to `ZONES` in `src/config/zones.ts`, and its flag to `src/assets/flags/` and `ZoneFlag.vue`. Pick its `lane` so its pole does not cross a flag it can stand near.

## Deploy

A push to `master` runs `.github/workflows/deploy.yml`: tests, typecheck and build, then GitHub Pages. If any check fails, nothing is deployed.

Home-screen icons keep working as long as the address and `public/favicon.*` stay where they are. There is deliberately no service worker, so a new version reaches everyone the next time they open the page.
