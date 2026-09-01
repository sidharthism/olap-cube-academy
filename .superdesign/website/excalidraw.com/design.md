---
version: "superdesign-alpha"
name: "Whiteboard Utility Flat"
description: "A near-white, flat-design canvas application chrome with one rationed indigo accent, hand-drawn annotation callouts, and sharp-to-slightly-rounded utility controls floating on an open working surface."
colors:
  background: "#FFFFFF"
  surface: "#ECECF4"
  text-primary: "#1B1B1F"
  text-secondary: "#999999"
  text-muted: "#B8B8B8"
  accent: "#6965DB"
  accent-hover: "#5B57D1"
  accent-tint: "#F1F0FF"
  accent-tint-alt: "#E0DFFF"
  border-neutral: "#B8B8B8"
  border-accent: "#6965DB"
typography:
  display-lg:
    fontFamily: "Times New Roman"
    fontSize: "32px"
    fontWeight: 700
  headline-md:
    fontFamily: "Assistant"
    fontSize: "24px"
    fontWeight: 700
  body-md:
    fontFamily: "Times New Roman"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.5"
  ui-label:
    fontFamily: "Arial"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.4"
  accent-hand:
    fontFamily: "Excalifont"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.4"
spacing:
  base: "4px"
  gap-sm: "8px"
  gap-md: "12px"
  gap-lg: "20px"
  section-padding: "48px"
rounded:
  control-tight: "4px"
  control: "6px"
  control-primary: "8px"
  square: "4px"
  pill: "8px"
components:
  button-primary:
    background: "#6965DB"
    text-color: "#FFFFFF"
    radius: "8px"
    height: "36px"
    padding: "10px"
    border: "1px solid rgb(105, 101, 219)"
    shadow: "rgb(255, 255, 255) 0px 0px 0px 1px"
    hover-background: "#5B57D1"
  button-ghost:
    background: "transparent"
    text-color: "#999999"
    radius: "6px"
    height: "42px"
    padding: "12px"
    border: "1px solid rgba(0, 0, 0, 0)"
    hover-background: "#F1F0FF"
  button-tint-flat:
    background: "#ECECF4"
    text-color: "#1B1B1F"
    radius: "0px"
    height: "36px"
    padding: "0px 10px"
  button-elevated-icon:
    background: "#FFFFFF"
    text-color: "#1B1B1F"
    radius: "8px"
    height: "36px"
    padding: "0px"
    shadow: "rgb(255, 255, 255) 0px 0px 0px 1px"
  card-panel:
    background: "#FFFFFF"
    radius: "8px"
    padding: "20px"
    shadow: "rgba(0, 0, 0, 0.17) 0px 0px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 3px 0px, rgba(0, 0, 0, 0.05) 0px 7px 14px 0px"
---
# Whiteboard Utility Flat
Source: https://excalidraw.com

## Overview
This is flat-design application chrome at its most restrained: a nearly pure-white infinite canvas (the pixel field is ~96% `#FFFFFF`) framed by a thin ring of floating, sharp-to-softly-rounded utility controls. The aesthetic is functional minimalism — no shadows on the canvas itself, no gradients, no imagery — with all visual interest concentrated in two devices: a single saturated indigo (`#6965DB`) reserved for the one primary action, and a hand-drawn annotation layer (arrows and Excalifont captions) that behaves like sticky-note callouts pointing at the real controls. Structurally this is a tool palette + empty stage pattern, the same DNA as a design tool or whiteboard app shell, not a marketing page — hierarchy is established by position (top toolbar, top-right actions, bottom-left zoom, bottom-right help) rather than by scale or color.

## Composition
The frame reads in five fixed zones: a top-left icon button (hamburger menu) with a hand-drawn arrow and caption beneath it; a centered floating toolbar strip at the very top holding the drawing-tool cluster; a top-right cluster of two buttons (a flat tint button beside a solid indigo pill); a dead-center stage holding a wordmark lockup, a three-line disclaimer, and a stacked list of four text-icon rows; and a bottom edge split between a zoom control (bottom-left) and a help/collaboration status cluster (bottom-right). Density is deliberately near-zero — the canvas is intentionally empty so hand-drawn arrows can annotate it without competing content. The deliberate choice is emptiness-as-onboarding: rather than populate the stage with sample shapes or marketing copy, the system leaves the canvas blank and uses only pointer annotations to teach, rejecting the alternative of a populated demo/dashboard-style first screen.

## Colors
`#FFFFFF` carries ~63% of declared area and effectively all of the rendered pixel field — this is the background/stage, not a token you color. `#ECECF4` (a pale lavender-gray, ~30% declared area) is the secondary chrome tint, used for flat inactive-state fills. `#6965DB` (indigo) covers only ~4% of declared area — it is rationed to exactly one control: the primary action pill in the top-right cluster. `#E0DFFF` and `#F1F0FF` are the same hue diluted further, reserved for hover/selected tint states, never for resting fills. Text ink is `#1B1B1F` (near-black, not pure black) for primary labels and `#000000` for body copy in the stage; `#B8B8B8`/`#999999` carry secondary and disabled-feeling labels, and border strokes use the same `#B8B8B8` neutral or `#6965DB` when a border needs to echo the accent. The palette leaves the entire canvas surface uncolored on purpose — color exists only on interactive chrome, never on the workspace.

## Typography
Three families do three distinct jobs. Times New Roman at 32px/700 is the display face — used for the largest single lockup on the page (the wordmark/hero text), giving an unexpected serif-editorial note inside an otherwise sans utility shell. Assistant at 24px/700 is the headline sans, used wherever a bold short label needs more weight than body text. Body copy defaults to Times New Roman 16px/400 in `#000000`, with secondary lines dropping to the `#B8B8B8` tone — so even paragraph text carries the serif accent rather than a neutral UI sans. Arial serves the small interface labels (menu rows, tooltips, shortcut hints) at utility sizes. The signature accent family is Excalifont — a hand-drawn/sketch face used exclusively for the pointer-arrow captions, marking them as informal, ephemeral annotations distinct from any real UI label.

## Layout
The dominant structural grid is a 3-column row (gap 48px) holding three roughly-equal items in the ~32%/32%/2% width pattern — read as two full-size content columns flanking a thin divider/spacer, used for the stacked action-list under the wordmark. Beneath that, single-column stacks (gap 16px, then gap 4px) hold the tight vertical list of four labeled rows (Open, Help, Live collaboration, Sign up), each row a one-column, one-item group — a simple list layout, not a card grid. There is no max-width container in the traditional marketing sense; the canvas is edge-to-edge and floating chrome is positioned absolutely at fixed offsets from the viewport edges. Spacing throughout chrome elements is tight and consistent with an 4–20px scale (4, 8, 12, 20px steps), appropriate for dense toolbar controls rather than generous marketing whitespace.

## Components
- **Toolbar (top-center)**: appears once, centered at the top edge of the viewport. Contains the drawing-tool cluster (lock, hand, pointer, and shape icons) as a single horizontal row of icon buttons. Surface is `#FFFFFF` with radius 8px and the resting shadow `rgb(255, 255, 255) 0px 0px 0px 1px`, giving it a crisp hairline separation from the canvas rather than a drop shadow. Internally it's icon-only, no labels, with the active tool (pointer) shown in the accent tint state.
- **Primary action button (top-right)**: one instance, top-right corner, paired beside a secondary flat button. Surface `#6965DB` fill, text `#FFFFFF`, radius 8px, height 36px, padding 10px, border `1px solid rgb(105, 101, 219)`, resting shadow `rgb(255, 255, 255) 0px 0px 0px 1px`; hover shifts fill to `#5B57D1`. This is the highest-contrast control on the page and the closest analog to a hero primary CTA — solid, saturated, pill-cornered relative to its neighbors.
- **Secondary flat button (top-right, beside primary)**: one instance, immediately left of the primary pill. Surface `#ECECF4`, text `#1B1B1F`, radius 0px (square corners — sharp, no rounding at all), height 36px, padding 0 10px. Its zero-radius reads as a deliberately flatter, lower-emphasis sibling to the primary pill.
- **Ghost toolbar buttons (scattered, top area)**: ×3 measured, transparent fill, text `#999999`, radius 6px (slightly-rounded), height 42px, padding 12px, invisible border (`1px solid rgba(0,0,0,0)`) at rest; hover fills to `#F1F0FF` tint. These are the individual icon buttons composing the toolbar and the top-left hamburger menu.
- **Elevated icon button (bottom-right)**: one instance, bottom-right corner (help/status control). Surface `#FFFFFF`, text `#1B1B1F`, radius 8px, height 36px, zero padding, resting shadow `rgb(255, 255, 255) 0px 0px 0px 1px` — same crisp-edge treatment as the toolbar, floating free of any container.
- **Zoom control (bottom-left)**: a compact horizontal cluster (minus / percentage / plus) sitting flush to the bottom-left corner, flat and borderless, matching the ghost button's low-emphasis text tone.
- **Center-stage panel**: one instance, dead-center of the empty canvas. Not a bordered card — it's a transparent grouping of a wordmark lockup, a 3-line secondary-tone disclaimer paragraph (Times New Roman, `#B8B8B8`), and a single-column list of four rows. Each row pairs a small icon + label (left) with a muted keyboard-shortcut hint (right, `#999999`/Arial). No imagery, no chips, no numerals — pure text-and-icon rows, gap 16px between them, gap 4px within the tightest sub-grouping.
- **Hand-drawn annotation callouts**: ×2+ instances scattered near the top-left and top-center chrome. Each is a curved arrow rendered in the same muted gray as secondary text, paired with an Excalifont caption. These sit directly on the white canvas with no card surface at all — they are graphic overlays, not components with fill/radius.
- **Footer**: background transparent, a single link, positioned at the extreme edge with no visual container — consistent with the page's overall avoidance of bordered chrome anywhere except the floating control clusters.

## Graphics & Effects
No gradients are present anywhere in this system — every fill is flat and solid. Two shadow tokens carry all elevation in the design: `rgb(255, 255, 255) 0px 0px 0px 1px`, a hairline white ring used on every floating white/indigo control to separate it crisply from the white canvas beneath (an outline-as-shadow trick rather than a drop shadow); and `rgba(0, 0, 0, 0.17) 0px 0px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 3px 0px, rgba(0, 0, 0, 0.05) 0px 7px 14px 0px`, a soft triple-layer drop shadow reserved for panel-style surfaces that need to visually lift off the stage (dropdowns, dialogs). Two `canvas` elements underlie the visible interface — the actual drawing surface and its interaction layer — which in a static rebuild should be stood in with a flat white rectangle; there is no baked texture, noise, or photographic layer of any kind. The overall image treatment is line-art only: everything on screen is either flat-filled UI chrome or thin-stroke hand-drawn annotation.

## Motion
Motion is utilitarian and near-instant: `transform 0.5s ease-in-out` handles any repositioning transitions (e.g., panel slides), while `visibility, opacity 0s, 0.5s linear, ease` staggers a hide/show pair so elements disappear instantly but fade in over 0.5s. Keyframe animations are narrowly functional rather than decorative: `rotate` and `dash` drive tool-specific stroke animations, `excalidraw-color-dnd-march` and `excalidraw-color-dnd-duplicate` support drag-and-drop swatch feedback, `Toast-fade-in` governs transient notification entrances, and `library-unit__adder-animation` pulses a library-add affordance. Scroll-driven CSS animations are present but scoped to canvas panning, not page scroll. Nothing overshoots or springs — every transition is a calm linear or ease-in-out fade/move, matching the tool's utility register.

## Guardrails
- Never apply the indigo `#6965DB` to more than one primary control at a time — it is a single-use accent, not a palette color for repeated buttons or backgrounds.
- Never add a drop shadow to the canvas/stage background; the flat white stage must stay shadow-free, with shadows reserved for floating chrome only.
- Never render the Excalifont hand-drawn captions as a UI label face — it is exclusively for sketchy annotation callouts, not buttons, headings, or body copy.
- Never round the flat `#ECECF4` secondary button — its zero-radius square corner is a deliberate contrast against the primary pill's 8px radius.
- Never populate the center stage with sample content or imagery; the emptiness is structural, not a placeholder to be filled.
- Never substitute a gradient for any fill in this system — every surface here is flat and solid.