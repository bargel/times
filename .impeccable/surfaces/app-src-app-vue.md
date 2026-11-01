---
version: 1
slug: "app-src-app-vue"
primary_target: "app/src/App.vue"
related_targets: []
---

Scope: the single PLUACAN screen. Mode: Operate. Phone first; several users open it from a home-screen icon.

Job: pick a time, see it in Vancouver, Kyiv and Warsaw, and paste it into Discord. It is not a clock.

## Direction contract

THESIS: One line of the day, one picture of the day, and three flags hanging from it. Because the line is a wall clock and not any one zone, a single picture of day and night tells you who is awake. Refuses the category default of cards or stacked per-zone rows.

OWN-WORLD: A slim landscape running from night through dawn and noon to dusk and back: sky, sun, moon, stars, layered hills that change colour with the hour. Night navy ink on a pale daylight ground in light theme; moonlit ink on night navy in dark. Sunset orange only for a date that differs and for focus. Figtree, tabular numerals. Real flags on poles. No cards, no glow, no gradient text.

STORY: Open: the three times are already there and following the clock. Drag any flag, or press the picture, and all three move together. Copy for Discord or as plain text. Now returns to the clock.

FIRST VIEWPORT: Phone 390x844: the wordmark at the top; low on the screen, the date stepper and Now directly above the three times in three columns, directly above the picture; hour numbers under the picture; poles rising from the flags to touch those numbers; two copy buttons under the thumb. Desktop: the same stack centred, wider and larger.

FORM: User-pinned after the first hand was rejected as bulky: the one-line composition of the old tool crossed with the picture direction. Position on the ordered list: a refinement of the top grounded candidate. seed:a10626ab6645365d

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

The drag: pressing a flag lifts it, the pole follows the finger in 30-minute steps, the hour number it touches goes bold (on the half hour, the dot between numbers grows instead), and all three times change at once.

## Motion

Poles glide with a short exponential ease-out when the moment jumps (Now, date, a press on the picture). No transition during a drag, none on wrap-around, none with reduced motion. No entrance animation: content is there on first paint.
