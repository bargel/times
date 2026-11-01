---
name: PLUACAN
description: One line of the day, one picture of the day, and three real flags on poles for Vancouver, Kyiv and Warsaw.
colors:
  ground: "#f3f7fb"
  ink: "#12183a"
  ink-soft: "#4f5775"
  edge: "#7f88a6"
  sunset: "#b5400d"
  press: "#2a3360"
  selection: "#ffd9ae"
  ground-night: "#0c1029"
  ink-night: "#eef1fb"
  ink-soft-night: "#a7afcd"
  edge-night: "#5f688f"
  sunset-night: "#ffb27a"
  press-night: "#cdd3ea"
  selection-night: "#5b3a2a"
  picture-night: "#0c1130"
  picture-dusk: "#5f4d7f"
  picture-dawn-coral: "#d98a78"
  picture-noon-sky: "#86c9ef"
  picture-sun: "#fff4c2"
  picture-moon: "#f4efd8"
  picture-hills-far: "#6fa596"
  picture-hills-near: "#3a7564"
typography:
  display:
    fontFamily: "'Figtree Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 9.6vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1"
  title:
    fontFamily: "'Figtree Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.02em"
  body:
    fontFamily: "'Figtree Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.3
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "'Figtree Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.3
  hour:
    fontFamily: "'Figtree Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "17px"
    fontFeature: "'tnum' 1"
rounded:
  sm: "2px"
  md: "8px"
  full: "50%"
spacing:
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 8px"
  button-primary-hover:
    backgroundColor: "{colors.press}"
    textColor: "{colors.ground}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 8px"
  control:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  zone-flag:
    width: "30px"
    height: "20px"
---

# Design System: PLUACAN

## Overview

**Creative North Star: "The One Line"**

PLUACAN is one line of the day. A slim picture runs from night through dawn and noon to dusk and back: sky, sun, moon, stars and two layers of hills that change colour with the hour. Three real flags hang from poles that touch the hour numerals. The line is a wall clock shared by all three zones, not the day of any one of them, so a single picture of day and night says who is awake. Nothing else competes with it.

The surface is small and quiet. The three times sit in three columns, low on a phone where the thumb is, directly above the picture; the two copy actions sit under it. Ink is night navy on a pale daylight ground in light mode, and moonlit ink on the sky's own navy in dark mode. Sunset orange is the only warm colour in the interface and it is kept for a date that differs and for focus. Text is Figtree with tabular numerals, so times do not shift as they change.

Rejected in review as too bulky: cards, stacked per-zone rows, big tiles and a dial. Simplicity is a binding constraint, and none of these may return.

**Key Characteristics:**
- One shared wall-clock line; no zone is a second-class citizen.
- A picture, not a chart: the sky itself tells the time of day.
- Flat surfaces. Depth appears only as a response to a held flag, and as a thin edge around the night picture in dark mode.
- Figtree with tabular numerals; English sentence-case copy.
- Phone first; the working group sits low under the thumb and the hour row thins on narrow screens.

## Colors

Two mirrored palettes drawn from the sky: a daylight set for light mode and a night set for dark mode. The same roles are used in both; `prefers-color-scheme` switches them.

### Primary
- **Night Ink** (`#12183a`, night set: Moonlit Ink `#eef1fb`): all primary text, the primary button fill, the flag poles, the touched hour numerals and the copy-button border. Ink carries nearly all the contrast on the page (16:1 on the daylight ground).

### Secondary
- **Pressed Navy** (`#2a3360`, night set: Pale Press `#cdd3ea`): the hover and pressed fill of the primary button.

### Tertiary
- **Sunset Ember** (`#b5400d`, night set: Ember Glow `#ffb27a`): reserved for three things: a date that differs from the one the readout is showing, keyboard focus, and a failed copy rings. It is the page's only warm accent.

### Neutral
- **Daylight Ground** (`#f3f7fb`, night set: Night Ground `#0c1029`): the page background and the text colour on filled buttons.
- **Dusk Slate** (`#4f5775`, night set: Moon Slate `#a7afcd`): secondary text: zone names, 12h times, dates, hour numerals.
- **Haze Edge** (`#7f88a6`, night set: Dusk Edge `#5f688f`): the outline of the day controls (the date stepper and the Now button).
- **Dawn Peach Selection** (`#ffd9ae`, night set: Umber Selection `#5b3a2a`): text selection highlight.

### Picture
The picture is drawn with its own colours, written directly in the scene: sky stops from Night Sky `#0c1130` through Dusk Violet `#5f4d7f`, Dawn Coral `#d98a78` and Noon Sky `#86c9ef` back to Night Sky, a Sun `#fff4c2` and Moon `#f4efd8`, and two Hill Green layers (Far `#6fa596`, Near `#3a7564`). These are not interface tokens; they belong to the picture and do not appear in controls.

### Named Rules
**The Sunset Reserve Rule.** Sunset is for a date that differs from the one shown, for keyboard focus and for a failed copy. Nothing else in the interface takes that colour, so when it appears it means "look here".

**The Ink Carries Rule.** Ink and ground carry the interface. Outside the picture, the interface uses navy-based neutrals and the one sunset accent; the picture is the only place the palette opens up.

## Typography

**Display Font:** Figtree Variable (self-hosted through `@fontsource-variable/figtree`), with `system-ui, -apple-system, Segoe UI, Roboto, sans-serif` as fallback.
**Body Font:** Figtree Variable, the same family.
**Label/Mono Font:** none in the interface. The text offered for copying by hand after a failed copy is set in the system monospace stack; it is the only text outside Figtree.

**Character:** One humanist-geometric sans does all the work. Weight and size carry the hierarchy, and tabular numerals keep the changing times from shifting.

### Hierarchy
- **Display** (700, `clamp(2rem, 9.6vw, 4.25rem)`, line-height 1.05, letter-spacing -0.03em): the three large times. Tabular numerals. In landscape phones it drops to 1.625rem.
- **Title** (700, 18px, letter-spacing 0.02em; 20px from 700px wide, 15px below 360px): the PLUACAN wordmark.
- **Body** (400, 16px, line-height 1.3): default text; button labels inherit it. Buttons are 600 weight, the Now control 600, and the date label 600 at 17px.
- **Label** (500, 14px, line-height 1.3): city names beside their flags, in Dusk Slate. The 12h time and date lines below each big time are 14px, 400, Dusk Slate.
- **Hour** (400, 12px, line-height 17px): hour numerals under the picture, in Dusk Slate; a touched hour turns Night Ink and 700.

### Named Rules
**The Tabular Rule.** Every number in the interface is tabular. A time that changes width when it ticks is a defect.

## Layout

A single column centred to 960px, with 16px side gutters and 14px top and bottom padding (28px from 700px wide). Safe-area insets are respected.

- **Top:** the house emblem (`public/favicon.png`, unaltered, 32px with the 8px radius and a thin edge) beside the wordmark. It is hidden on a phone on its side, where there is no height to spare.
- **Working group** (the day controls directly above the times, then the three times, the picture with its hours and poles, and the two copy actions): on a phone it sits low, with `margin-top: auto` and 24px above it, so the thumb reaches the copy buttons. From 700px wide it is vertically centred with 32px block padding. The picture sits 20px below the times on a phone and 32px on wide screens.
- **Three columns:** the times use an equal three-column grid with 8px gaps. The copy actions are two equal columns with 8px gaps, and fixed 200px columns from 700px wide.
- **The line tail:** the picture and the hour row run 32px past the right edge of the working group. That room is the night continuing past 24:00, so a flag at the end of the day still fits on screen.
- **Picture height:** `clamp(52px, 6.4vw, 72px)`; hour row 20px; pole area 100px (86px in landscape).

### Named Rules
**The Quiet Hours Rule.** On narrow screens the hour row thins instead of shrinking. Below 480px only the even hours show, plus any hour a flag touches; an even hour directly beside a touched one is removed, so touched numerals never crowd. Below 380px only every fourth hour shows, plus the touched ones.

**The Phone-Low Rule.** The working group rests at the bottom of a phone screen, where the thumb reaches it, and rests in the middle of a large one. Content is not placed high on a phone just to fill the screen.

**The Landscape Compact Rule.** In landscape with a height under 500px, the page, picture (40px), pole area (86px) and readout tighten, and the 12h time and date sit inline beside each big time.

## Elevation & Depth

Flat by default. Surfaces have no shadow at rest, and depth is conveyed by ink, ground and the picture. The only shadow in the system is a response to state: a flag that is being held lifts with a soft drop shadow (`0 3px 8px rgb(9 13 36 / 0.35)`). In dark mode the night picture, which is almost the page's own navy, gets a 1px inset edge in ink at 16% so it still reads as a picture.

### Shadow Vocabulary
- **Held flag** (`box-shadow: 0 3px 8px rgb(9 13 36 / 0.35)`): a flag under the finger, with a 2px downward nudge and a 1.12 scale. Shown only while held.
- **Picture edge, dark mode** (`box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink) 16%, transparent)`): the night picture's outline in the dark theme only.

### Named Rules
**The Flat-By-Default Rule.** Nothing casts a shadow at rest. Shadow appears only when something is being held, and the only thing that is held is a flag.

## Shapes

Soft and small. Controls and the picture use an 8px radius; flags sit flush against the pole like a flag on a staff, with 5px outer corners and a soft shadow, and the pole carries on 4px below them; the poles are 2px lines; the status dot is round. Bar controls carry a 1px Haze Edge outline. Share buttons carry a 1.5px Night Ink outline. Flags are outlined with a 1px ink line at 24% (12% at night) so a white stripe stays visible on the pale ground.

No card, tile or panel is used. Groups are separated by space, never by a box.

## Components

### Buttons
- **Shape:** 8px radius (`rounded.md`), 52px tall, 0 8px padding, 600 weight, 16px text that may scale down to 14px on narrow screens. Labels never wrap.
- **Primary:** Night Ink fill with Daylight Ground text and a 1.5px Night Ink border. One per group, used for the action that copies the Discord timestamp.
- **Hover / Pressed:** on fine pointers the primary fill moves to Pressed Navy; when pressed, the button nudges 1px down. Transitions run 120ms on the ease-out curve.
- **Secondary:** transparent fill, Night Ink text and a 1.5px Night Ink border; hover adds a 10% Night Ink wash.

### Bar Controls
- **Style:** 44px tall, 8px radius, transparent fill, 1px Haze Edge outline, Night Ink text in the inherited 16px body size.
- **Now:** 600 weight. Filled with Night Ink while the page follows the clock, outlined once a time has been picked.
- **Date:** one outlined stepper filling the row: previous day, the date as `Wed 15 Jul` (with the year when it is not this year), next day. An invisible native date field covers the label, so a press opens the system's own calendar. Reached by keyboard, the field itself replaces the label so typing is visible. A custom calendar is deliberately not used. The previous-day arrow is disabled at the minimum date.

### Zone Flags and Poles
- **Flags:** real flag artwork, 30×20px on the line and 18×12px beside the city names. Flags are never the only identification: the city name always sits beside them or labels its control.
- **Poles:** 2px Night Ink lines that start at the bottom of the hour row and hang from it to the flag. The flag sits at the pole's end.
- **Lanes:** Vancouver and Kyiv hang at 36px. Warsaw hangs at 80px, one lane lower, because Warsaw is always an hour left of Kyiv and its pole has to clear Kyiv's flag. Landscape uses 26px and 62px.
- **Touch:** the pole's touch area extends about 12px above and below and 7px to each side, which is a fingertip-sized target around a 30px flag.

### Day Line
- **Picture:** the sky, sun, moon, stars and layered hills, sized to the line and clipped to the 8px radius.
- **Hours:** 25 numerals from 00 to 24, positioned on the line; a numeral a pole stands on turns Night Ink and bold.
- **Half hours:** a small Dusk Slate dot between each pair of numerals, level with them; below 480px the dots drop to their own row under the numerals. A pole on the half hour touches its dot, which grows and turns Night Ink, and no numeral goes bold. The line works only in half hours: while the page follows the clock, a pole stands on the nearest one, and the big times keep the exact minute.
- **Drag:** pressing a flag lifts it; the pole follows the finger in 30-minute steps, and all three zones move together. Pressing the picture moves the home zone's clock to where the press lands, and the others follow.
- **Motion:** a jump (Now, date change, a press on the picture) glides poles for 280ms on the ease-out curve. A drag never eases, and a flag wrapping around the day does not glide. Reduced motion removes the transition entirely.

### Time Readout
- **Structure:** three equal columns, one per zone: the flag and city name, the big time, the 12h time, and the date. A date that differs from the selected day is set in Sunset Ember at 600 weight.

### Copy Actions
- **Layout:** two buttons side by side under the picture: "Copy for Discord" (primary) and "Copy plain text" (secondary). After use, the pressed button's label reads "Copied!" or "Copy failed".
- **Copy failed:** the button says so, and a Sunset note with a read-only monospace field holds the exact text to copy by hand, until the next attempt. Nothing shows this while copying works.

### Focus
- **Ring:** a 3px Sunset Ember outline offset 2px. A focused flag shows the same 3px outline at a 3px offset.

## Do's and Don'ts

### Do:
- **Do** set every number in Figtree with tabular numerals; the body sets `font-variant-numeric: tabular-nums` for the whole page.
- **Do** keep one shared line: show all three zones on one picture, with no separate row, card or tile per zone.
- **Do** identify every zone by its real flag and its city name together.
- **Do** derive dark-mode colours from the night set (`*-night`) with the same roles, not by inverting the daylight set.
- **Do** thin the hour row on narrow screens by removing hours; never shrink the numerals to fit.
- **Do** keep the working group low on a phone, under the thumb, and the copy actions within reach below it.

### Don't:
- **Don't** bring back cards, stacked per-zone rows, big tiles or a dial. Each was rejected as too bulky.
- **Don't** use Sunset Ember for anything except a date that differs from the one shown, keyboard focus and a failed copy.
- **Don't** add glow or gradient text. Gradients belong only inside the picture.
- **Don't** replace the real flags with icons or emoji in the interface. Emoji flags appear only in the copied plain text.
- **Don't** add an entrance animation. Content is present on first paint.
- **Don't** add a second interface typeface.
