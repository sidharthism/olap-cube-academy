# The Decision Room — Portable Design Guide

This document describes the implemented visual system for **The Decision Room — OLAP Cube Academy**. It is intended to give a designer or developer enough context to reproduce the same visual language on another website without copying the course content.

The current implementation is the source of truth:

- `app/globals.css` — tokens, components, interaction states, and responsive rules
- `app/layout.tsx` — fonts, metadata, favicon, and social metadata
- `app/page.tsx` — application shell and shared navigation composition
- `app/course-labs.tsx` — interactive whiteboard patterns
- `public/favicon.svg` — primary identity mark

## 1. Design in one sentence

Build a calm, professional analyst's whiteboard: a warm near-white dotted canvas, floating paper-like panels, readable interface typography, restrained hand-drawn accents, and one rationed indigo action color.

The experience should feel like **an analyst teaching on an interactive whiteboard**, not a dashboard, drawing editor, generic SaaS product, fantasy game, or children's classroom app.

## 2. Visual DNA

### Core ideas

1. Most of the screen is open canvas.
2. Functional UI is geometrically aligned and easy to scan.
3. Selected objects receive imperfect outlines, slight rotation, or pale indigo tint.
4. Handwriting is used for personality and explanation, never for dense reading.
5. Technical material uses monospace.
6. White floating panels create structure without turning every idea into a card.
7. Green, orange, and red communicate meaning; they are not decoration.
8. Motion is calm, short, and optional.

### Personality

- Human, investigative, curious
- Precise without feeling clinical
- Playful through line work, not through cartoons or rewards overload
- Spacious and editorial rather than data-dense
- Trustworthy and evidence-oriented

### Hard constraints

Do not introduce:

- Dark dashboard chrome
- Decorative color gradients
- Glassmorphism or backdrop blur
- Glossy or photorealistic 3D
- Stock photography
- Generic SaaS card grids
- Large areas of saturated semantic color
- Long handwritten paragraphs
- Handwritten SQL, tables, form controls, or dense navigation
- More than one solid indigo primary action in one local interaction region

The dotted canvas uses `radial-gradient()` as a repeating dot-pattern implementation. It is not a decorative color gradient.

## 3. Design tokens

These are the exact implemented tokens.

```css
:root {
  --canvas: #fffefa;
  --chrome: #f0eff7;
  --ink: #1b1b1f;
  --muted: #676672;
  --line: #cfced8;

  --indigo: #6965db;
  --indigo-dark: #5652c6;
  --indigo-tint: #f1f0ff;

  --green: #267a3b;
  --orange: #b75c00;
  --red: #b42318;

  --hand: 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive;
  --sans: var(--font-geist-sans), Inter, ui-sans-serif, system-ui, sans-serif;
  --mono: var(--font-geist-mono), 'SFMono-Regular', Consolas, monospace;
}
```

### Color roles

| Token | Role | Usage |
|---|---|---|
| `--canvas` | Main background | Page, drawers, whiteboard surroundings |
| `--chrome` | Quiet structural surface | Prerequisites, utility headers, secondary groups |
| `--ink` | Primary text and outlines | Headings, rough borders, important controls |
| `--muted` | Secondary information | Objectives, descriptions, metadata |
| `--line` | Neutral structure | Dividers, inactive borders, dashed connectors |
| `--indigo` | Primary action and selection | CTA, focus, active outline, progress |
| `--indigo-dark` | Interactive indigo text/hover | Links, hover states, technical emphasis |
| `--indigo-tint` | Selected/mentored surface | Active rows, story notes, feedback |
| `--green` | Verified or completed | Checks, reconciled states, completion |
| `--orange` | Attention or caveat | XP, warnings, unresolved evidence |
| `--red` | Error or exclusion | Invalid joins, failed checks, excluded records |

### Supporting literal colors

These values occur in implemented components and may be promoted to tokens in a new project:

```css
--panel-border: #e5e4ec;
--panel-hover: #f6f5fa;
--paper-warm: #fffef9;
--note-yellow: #fffdf2;
--sql-surface: #202230;
--sql-chrome: #292b3c;
--sql-line: #3d3f51;
```

### Color discipline

- Let warm white occupy most of the viewport.
- Use solid indigo for the single primary action nearest the learner's current task.
- Use pale indigo for repeated selections and active navigation.
- Use semantic colors as strokes, checks, small labels, or light backgrounds.
- Do not use color as the only status indicator; pair it with a word, icon, or shape.
- The SQL workbench is the only intentional dark region.

## 4. Typography

### Font loading

The site loads Geist Sans and Geist Mono through `next/font/google` and exposes them as CSS variables:

```tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

<body className={`${geistSans.variable} ${geistMono.variable}`}>
  {children}
</body>
```

For a non-Next.js site, load Geist Sans and Geist Mono using local files or a web-font provider, then assign equivalent variables.

### Three-layer type system

#### 1. Handwritten display layer

Current stack:

```css
font-family: 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive;
```

Use for:

- Brand title
- Prologue and chapter titles
- Mira's short notes
- Diagram labels
- Large takeaways
- Rough numeric markers
- Short operation names

Do not use for:

- Paragraphs longer than roughly three lines
- Buttons with dense copy
- Forms, tables, SQL, or small metadata

Portability warning: this stack uses operating-system fonts and will vary by device. If exact cross-platform fidelity matters, self-host one licensed hand-drawn font, load it before the fallbacks, and keep the same weights and line-heights.

#### 2. Readable interface layer

Use Geist Sans for body text, controls, navigation, lessons, quiz answers, tables, and accessibility text.

```css
font-family: var(--sans);
```

#### 3. Technical layer

Use Geist Mono for SQL, evidence keys, field names, cube coordinates, progress values, timestamps, metadata, and compact labels.

```css
font-family: var(--mono);
```

### Implemented scale

| Element | Size | Additional rules |
|---|---|---|
| Prologue headline | `clamp(2.8rem, 5.3vw, 5.25rem)` | Hand, `1.03` line-height, `-0.045em` tracking |
| Chapter headline | `clamp(2.3rem, 6vw, 4.7rem)` | Hand, `-0.04em` tracking |
| Section heading | `clamp(1.55rem, 3vw, 2rem)` | Hand, compact line-height |
| Benefit headline | `clamp(2rem, 3.3vw, 3rem)` | Hand |
| Lead copy | `1.02rem` | Sans, `1.75` line-height |
| Body/objective | `1rem–1.16rem` | Sans, `1.55–1.65` line-height |
| Control text | `0.78rem–0.84rem` | Sans, strong weight |
| Eyebrow | `0.69rem` | Sans, weight `750`, uppercase, `0.09em` tracking |
| Technical label | `0.58rem–0.75rem` | Mono |
| SQL | `0.69rem` | Mono, `1.65` line-height |

Keep normal paragraphs at `68ch` or less.

### Reusable type classes

```css
.hand-title,
.hand-heading,
.hand-display,
.hand-copy,
.hand-value {
  font-family: var(--hand);
}

.eyebrow {
  color: var(--muted);
  font-size: 0.69rem;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
```

## 5. Spacing and density

Use a 4px base rhythm:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

Practical rules:

- Global desktop inset: `16px`
- Floating panel padding: `16px` or `20px`
- Major content section padding: `clamp(20px, 3.5vw, 40px)`
- Major whiteboard gap: `24px–64px`
- Compact control gap: `6px–12px`
- Column gap in the application shell: `16px`
- Mobile content padding: `18px–20px`

Leave visible empty space around the key learning object. Do not fill every gap with content.

## 6. Canvas and surfaces

### Page canvas

```css
.academy-shell {
  min-height: 100vh;
  padding: 1rem 1rem 5.5rem;
  background-color: var(--canvas);
  background-image: radial-gradient(#dad9e3 1px, transparent 1px);
  background-size: 28px 28px;
}
```

The dot pattern should remain subtle. It is orientation texture, not decoration.

### Floating panel recipe

```css
.floating-panel {
  border: 1px solid #e5e4ec;
  border-radius: 12px 7px 11px 8px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow:
    0 1px 2px rgb(27 27 31 / 8%),
    0 10px 30px rgb(27 27 31 / 6%);
}
```

### Content paper recipe

```css
.content-paper {
  padding: clamp(1.25rem, 3.5vw, 2.5rem);
  border: 1px solid #e5e4ec;
  border-radius: 13px 8px 16px 9px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 1px 2px rgb(27 27 31 / 6%),
    0 12px 36px rgb(27 27 31 / 5%);
}
```

### Interactive whiteboard recipe

```css
.interactive-board {
  padding: clamp(0.75rem, 2vw, 1.25rem);
  border: 2px solid var(--ink);
  border-radius: 17px 9px 21px 11px / 10px 20px 9px 19px;
  background-color: #fff;
  background-image: radial-gradient(#e0dfe7 0.8px, transparent 0.8px);
  background-size: 22px 22px;
}
```

## 7. Shape, line, and depth

### Shape language

- Standard controls: `4px–8px` radius
- Paper panels: unequal radii such as `13px 8px 16px 9px`
- Hand-drawn pills/ovals: asymmetric percentage radii
- Decorative rotation: usually between `-1.2deg` and `1.2deg`
- Avatar or progress markers may rotate up to about `3deg`

Example rough oval:

```css
.rough-ring {
  position: relative;
  border: 2px solid var(--indigo);
  border-radius: 51% 46% 48% 43% / 43% 52% 46% 51%;
  transform: rotate(-2deg);
}
```

Example doubled hand-drawn outline:

```css
.sketch-mark {
  position: relative;
  border: 2px solid var(--ink);
  border-radius: 46% 52% 43% 49%;
}

.sketch-mark::after {
  position: absolute;
  inset: -5px 2px 2px -4px;
  border: 1px solid var(--line);
  border-radius: 52% 45% 50% 42%;
  content: '';
  pointer-events: none;
}
```

### Depth rules

- Use shadows only on floating chrome and paper panels.
- Do not shadow the open canvas.
- Offset solid shadows are acceptable for paper slips: `4px 5px 0 rgb(207 206 216 / 60%)`.
- Do not use blur-heavy shadows, inset glow, glass, or glossy highlights.

## 8. Application layout

### Top toolbar

Desktop:

```css
.topbar {
  position: sticky;
  top: 1rem;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(230px, 1fr) auto minmax(290px, 1fr);
  align-items: center;
  gap: 1.25rem;
  max-width: 1600px;
  min-height: 64px;
  margin: 0 auto;
  padding: 0.65rem 1rem;
}
```

Zones:

1. Brand lockup
2. Current workflow or stage navigation
3. Utility actions and progress

Keep the brand control borderless. The GitHub mark is also borderless and transparent; do not wrap it in decorative button chrome.

### Main chapter layout

```css
.course-layout {
  display: grid;
  grid-template-columns: 250px minmax(520px, 820px) 250px;
  justify-content: center;
  gap: 1rem;
  max-width: 1400px;
  margin: 1rem auto 0;
}
```

- Left: Mission path
- Center: current chapter papers and interactive board
- Right: sticky chapter inspector

### Prologue layout

```css
.prologue-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 1rem;
  max-width: 1400px;
  margin: 1rem auto 0;
}
```

The Prologue and chapter views use the same Mission path component. Preserve shared navigation components instead of creating visually similar duplicates.

### Sticky side panels

```css
.sticky-side-panel {
  position: sticky;
  top: 96px;
  align-self: start;
  max-height: calc(100vh - 112px);
  overflow: auto;
}
```

### Bottom navigation

- Fixed above the viewport edge
- White paper surface with restrained shadow
- Three zones: previous, status, next/current action
- Hide low-priority controls on small mobile screens
- Never cover the final content; reserve bottom padding in the page shell

## 9. Core component recipes

### Brand lockup

- Borderless horizontal control
- 38px identity tile
- Handwritten product title
- Small uppercase sans subtitle
- Clicking the brand returns to the introduction/prologue

Identity tile:

```css
.brand-tile {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 2px solid var(--ink);
  border-radius: 9px 5px 11px 6px;
  background: var(--indigo-tint);
  color: var(--indigo);
  transform: rotate(-2deg);
}
```

### Mission path

- One shared component across all route states
- Prologue appears as an unnumbered `P` entry above Act 1
- Numbered items are grouped by act
- Minimum 44px row target
- Current item: pale indigo fill plus rough indigo outline
- Completed item: green check and muted label
- Progress summary stays visible but should not lock navigation

### Stage navigation

- Horizontal compact text buttons
- Inactive stages use muted text
- Current stage receives pale indigo and a rough indigo oval
- Hide the full stage path when the header becomes too narrow

### Buttons

Primary:

```css
.primary-button {
  min-height: 44px;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--indigo);
  border-radius: 7px;
  background: var(--indigo);
  color: white;
  font-weight: 750;
}

.primary-button:hover {
  background: var(--indigo-dark);
}
```

Quiet:

```css
.quiet-button {
  min-height: 44px;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: white;
  font-weight: 750;
}

.quiet-button:hover {
  border-color: var(--ink);
}
```

Sketch button:

- White background
- 1.5px ink border
- Unequal radii
- Handwritten short label
- Hover changes border/text to indigo

Text action:

- Borderless
- Indigo-dark text
- Underline with 3px offset
- Use for downloads and secondary actions

Disabled controls use `opacity: 0.45` and `cursor: not-allowed`.

### Mentor or story note

- Pale indigo surface
- Ink outline with irregular radii
- 44–48px hand-drawn initial avatar
- Small uppercase eyebrow
- Readable sans explanation
- Handwriting limited to the concise quote or takeaway

### Chapter hero

- Content-paper surface
- 4px indigo top edge
- Small uppercase metadata row
- Large handwritten title
- Muted readable objective
- Optional faint oversized indigo oval at the upper-right

### Section heading

- 48px rough circular number
- Uppercase eyebrow
- Handwritten section title
- Left aligned; do not center normal chapter sections

### Evidence or report slips

- White paper
- 2px ink outline
- Unequal radii
- Tiny mono/sans label
- Short handwritten claim
- Muted readable explanation
- Rotation below roughly `1deg`
- Orange outline only for unresolved attention

### Concept notes

- Three-column desktop grid
- Warm paper tints
- Small offset shadow
- Tiny rough numbered circle
- Slight alternating rotation
- Collapse to one column at tablet size

### Selected choice/card

```css
.choice {
  min-height: 44px;
  border: 1px solid var(--line);
  background: white;
}

.choice[aria-pressed='true'],
.choice:has(input:checked) {
  border-color: var(--indigo);
  background: var(--indigo-tint);
}
```

Use native `button`, `input`, `label`, and `fieldset` semantics. Selection styling should follow `aria-pressed` or native checked state.

### SQL workbench

The SQL workbench is a focused technical exception to the light canvas:

- Surface: `#202230`
- Utility chrome: `#292b3c`
- Divider: `#3d3f51`
- Main text: `#f5f4ff`
- SQL text: Geist Mono
- `1.65` line-height
- Straight 8px radius
- Scroll code at a bounded height
- Keep controls readable and visually sober

### Quiz

- Neutral 8px panel
- Header and footer use pale neutral chrome
- Questions use semantic `fieldset` and `legend`
- Options use large labels and native radio inputs
- Selected option receives indigo border/tint
- Correct/wrong states use a 4px green/orange inset stroke plus text
- Explanations remain available; no timed or penalty UI

### Inspector and drawers

Inspector:

- 250px sticky floating panel on desktop
- Compact definitions and status rows
- Dashed dividers
- Full-width local actions
- Removed below 1180px

Drawer:

- Right aligned, maximum 500px
- Full viewport height
- Canvas dot pattern
- 2px ink left border
- Sticky white header
- 42px circular close control
- Dim backdrop: `rgb(27 27 31 / 26%)`

### Completion/status language

- Progress: indigo
- Completed/verified: green check plus word
- Attention: orange border/label plus explanation
- Error/excluded: red mark plus explicit label
- Missing data: em dash plus “No matching fact”
- Measured zero: numeric zero plus “measured zero”

## 10. Interaction behavior

### State hierarchy

1. Default: white surface, neutral border
2. Hover: darker neutral or indigo border
3. Selected/current: indigo border or rough outline plus pale tint
4. Completed: green check plus readable status
5. Attention: orange mark plus explanation
6. Error: red mark plus corrective copy
7. Disabled: reduced opacity; state still readable

### Primary-action rule

Show at most one solid indigo action in one local task region. Other actions should be quiet, sketch, or text buttons.

### Feedback

- Use `aria-live="polite"` for quiz, save, and interaction results.
- Move focus to new chapter/stage headings after navigation when appropriate.
- Keep retries unlimited.
- Do not gate exploration with artificial locks, lives, or timers.

## 11. Motion

Default duration range: `120ms–500ms`, ease-in-out.

Appropriate motion:

- Small link lift (`translateY(-1px)` or `-2px`)
- Selection outline tracing once
- Connector appearing between evidence and result
- Rows grouping during roll-up
- Labels swapping during pivot
- A check appearing after verification

Avoid:

- Bouncing
- Confetti
- Perpetual floating
- Repeating drawing loops
- Motion required to understand state

Always include:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

## 12. Responsive behavior

### Above 1180px

- Full three-zone header
- Mission path, central lesson, and right inspector visible
- Prologue uses Mission path plus wide content

### 1180px and below

- Header becomes two columns
- Prologue stage chip hides
- Main lesson becomes Mission path plus central content
- Right inspector hides
- Prologue hero becomes one column

### 820px and below

- Header becomes one column
- Course and Prologue become one-column layouts
- Mission path becomes non-sticky with a bounded scroll height
- Multi-column learning groups generally collapse to one column
- Data summaries may remain two columns when readable
- Footer status text may hide

### 560px and below

- Reduce page and section padding
- Hide XP and lower-priority footer buttons
- Allow the brand title to wrap
- Stack report slips instead of overlapping them
- Convert benefits, resource links, and evidence grids to one column
- Turn horizontal process arrows vertically
- Stack quiz header/footer and SQL actions

### Additional narrow behavior

Some data-heavy components collapse at 700px. Use a component-specific breakpoint when content becomes unreadable rather than forcing every component into the same breakpoint.

## 13. Accessibility contract

The visual style is incomplete unless these rules are preserved:

- WCAG AA contrast for essential text and controls
- Semantic landmarks and heading order
- Visible keyboard focus
- 44px minimum target height where practical
- Keyboard alternatives for drag interactions
- No timed tasks
- No drag-only tasks
- Live regions for dynamic feedback
- Native tables for tabular data
- List/table equivalents for sketches or cube views
- Handwriting never carries essential information alone
- Status uses icon/word in addition to color
- Dialogs trap focus, close with Escape, and restore previous focus
- Background content becomes inert while a modal drawer is open
- Skip link targets the current primary content
- Layout remains usable at 200% zoom

Global focus treatment:

```css
button:focus-visible,
a:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 3px solid var(--indigo);
  outline-offset: 3px;
}
```

## 14. Identity and assets

Current identity assets:

| File | Purpose |
|---|---|
| `public/favicon.svg` | Primary scalable favicon |
| `public/favicon-32.png` | 32×32 fallback favicon |
| `public/favicon-512.png` | High-resolution app icon |
| `public/apple-touch-icon.png` | 180×180 Apple touch icon |
| `public/github-mark.svg` | Borderless GitHub mark |
| `public/og.png` | Social sharing image |

The identity mark is a slightly irregular near-black rounded tile containing a compact indigo grid. Preserve the near-black outline, pale interior, indigo grid, irregular corners, and transparent exterior.

Metadata pattern:

```tsx
export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};
```

## 15. Portable starter CSS

The following compact foundation reproduces the most important design characteristics. Add component-specific styles after this block.

```css
:root {
  --canvas: #fffefa;
  --chrome: #f0eff7;
  --ink: #1b1b1f;
  --muted: #676672;
  --line: #cfced8;
  --indigo: #6965db;
  --indigo-dark: #5652c6;
  --indigo-tint: #f1f0ff;
  --green: #267a3b;
  --orange: #b75c00;
  --red: #b42318;
  --hand: 'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive;
  --sans: 'Geist', Inter, ui-sans-serif, system-ui, sans-serif;
  --mono: 'Geist Mono', 'SFMono-Regular', Consolas, monospace;
}

* { box-sizing: border-box; }

html {
  background: var(--canvas);
  color: var(--ink);
}

body {
  margin: 0;
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--sans);
}

button,
input,
select,
textarea {
  font: inherit;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid var(--indigo);
  outline-offset: 3px;
}

.whiteboard-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: var(--canvas);
  background-image: radial-gradient(#dad9e3 1px, transparent 1px);
  background-size: 28px 28px;
}

.floating-panel {
  border: 1px solid #e5e4ec;
  border-radius: 12px 7px 11px 8px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow:
    0 1px 2px rgb(27 27 31 / 8%),
    0 10px 30px rgb(27 27 31 / 6%);
}

.paper-section {
  padding: clamp(1.25rem, 3.5vw, 2.5rem);
  border: 1px solid #e5e4ec;
  border-radius: 13px 8px 16px 9px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 1px 2px rgb(27 27 31 / 6%),
    0 12px 36px rgb(27 27 31 / 5%);
}

.hand-display,
.hand-heading,
.hand-copy {
  font-family: var(--hand);
}

.eyebrow {
  color: var(--muted);
  font-size: 0.69rem;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.primary-action,
.quiet-action {
  min-height: 44px;
  padding: 0.65rem 0.9rem;
  border-radius: 7px;
  font-weight: 750;
  cursor: pointer;
}

.primary-action {
  border: 1px solid var(--indigo);
  background: var(--indigo);
  color: white;
}

.primary-action:hover {
  background: var(--indigo-dark);
}

.quiet-action {
  border: 1px solid var(--line);
  background: white;
  color: var(--ink);
}

.quiet-action:hover {
  border-color: var(--ink);
}

.is-selected {
  border-color: var(--indigo);
  background: var(--indigo-tint);
}

.technical {
  font-family: var(--mono);
}

@media (max-width: 820px) {
  .whiteboard-page { padding: 0.6rem; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

## 16. Portable page skeleton

Use shared shell components so the same toolbar and navigation appear across route states.

```html
<main class="whiteboard-page">
  <header class="floating-panel top-toolbar">
    <a class="brand-lockup" href="/">
      <img src="/favicon.svg" alt="" width="38" height="38" />
      <span>
        <strong class="hand-heading">Product name</strong>
        <small>Short descriptor</small>
      </span>
    </a>

    <nav aria-label="Current workflow">
      <!-- Compact stages; selected state uses pale indigo + rough outline. -->
    </nav>

    <div class="toolbar-actions">
      <!-- Quiet utilities, one primary action, compact status. -->
    </div>
  </header>

  <div class="application-layout">
    <aside class="floating-panel mission-path">
      <!-- Reuse this exact component on every route state. -->
    </aside>

    <article class="content-column">
      <section class="paper-section">
        <span class="eyebrow">Context</span>
        <h1 class="hand-display">Human, concise headline</h1>
        <p>Readable explanation limited to a comfortable line length.</p>
      </section>

      <section class="paper-section">
        <div class="interactive-board">
          <!-- Direct manipulation plus keyboard/click alternative. -->
        </div>
      </section>
    </article>

    <aside class="floating-panel inspector">
      <!-- Evidence, current status, or details. -->
    </aside>
  </div>
</main>
```

## 17. Adaptation checklist

When applying this design to another site:

1. Copy the tokens and load Geist Sans/Mono.
2. Decide whether system handwriting variation is acceptable; self-host a hand font if not.
3. Create the warm dotted canvas.
4. Build one shared floating toolbar.
5. Build one shared navigation/sidebar component and reuse it on every state.
6. Use open canvas plus a few paper surfaces; avoid card proliferation.
7. Reserve handwriting for short, expressive content.
8. Use mono for technical evidence and compact metadata.
9. Use indigo for selection and the current primary action.
10. Use green/orange/red only for explicit semantic meaning.
11. Add unequal radii and very small rotations to decorative outlines only.
12. Keep forms, tables, buttons, and hit targets straight and predictable.
13. Implement hover, selected, completed, attention, error, and disabled states.
14. Test the 1180px, 820px, and 560px breakpoints.
15. Test keyboard navigation, focus visibility, reduced motion, and 200% zoom.
16. Verify that every visual/drag interaction has a click and keyboard alternative.
17. Check that no local region contains competing solid indigo actions.

## 18. Review test

A new page belongs to this system when all of these are true:

- It reads first as a calm working whiteboard.
- The primary text is readable sans, not handwriting.
- Handwriting adds warmth and explanation in short bursts.
- Indigo clearly identifies the current action or selection.
- Panels appear to float like sheets or tools over the canvas.
- Roughness is subtle and does not reduce alignment or usability.
- Technical content feels precise through monospace and evidence structure.
- Mobile layouts stack cleanly without hiding essential content.
- Keyboard focus and dynamic feedback remain obvious.
- The page avoids generic SaaS, dark-dashboard, and decorative-card patterns.

If the page feels like a dashboard with a handwriting font added afterward, it has not applied the design system correctly.
