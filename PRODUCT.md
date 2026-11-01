# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A small group spread across Canada (Vancouver), Ukraine (Kyiv) and Poland (Warsaw) who coordinate over Discord. The job: pick a time for something, see it in all three places, and share it in Discord. It is not a clock.

Several users open it from an icon on their phone's home screen.

## Product Purpose

PLUACAN puts one moment on screen in all three places at once, and turns it into text ready to paste into Discord. Success: from opening the page, the times are readable immediately and a shareable time is seconds away.

## Positioning

The name is the product: PL + UA + CAN. It covers exactly these three places rather than the whole world, so nothing has to be searched for or configured.

## Operating Context

- Used on phones and desktops, in passing, usually mid-conversation in Discord.
- Output goes into Discord as a `<t:UNIX:f>` timestamp, which Discord renders in each reader's own zone, or as plain text lines.
- Home-screen icons are shortcuts to the URL, with no manifest or service worker behind them.

## Capabilities and Constraints

- Zones: America/Vancouver, Europe/Kyiv, Europe/Warsaw. UTC was an implementation leftover and is not shown.
- All zones sit on one 24-hour line at once. The line is a wall clock, not any one zone's day.
- The date picker follows the browser's time zone, including browsers outside the three zones.
- Follows the clock on open; picking a time moves in 30-minute steps across the day, including the 24:00 stop.
- Any zone's flag can be dragged to move the shared moment.
- Each zone shows 12h and 24h time and its date, which can differ between zones.
- Copy outputs are fixed formats: `<t:UNIX:f>`, and one `🇨🇦 4:00PM (16:00) - 2026-10-31` line per zone.
- `https://times.brgl.dev/` and the favicon paths must not change, or installed icons break.
- Static site on GitHub Pages. No backend, accounts or stored data.

## Brand Commitments

- The name PLUACAN and the existing favicon.
- Interface copy in English.
- Follows the system light or dark setting.

## Product Principles

- The answer is on screen before any interaction.
- One moment, shown everywhere: no zone is a second-class citizen on any device.
- Copying is the end of the job, so it is never more than a tap away.
- Simple over clever. Earlier proposals with cards and per-zone rows were rejected as bulky; the one line is the product.
- Phone first.

## Accessibility & Inclusion

Time selection works by keyboard and screen reader through a native range control. Flags are never the only way to identify a zone.
