# The Decision Room — Design System

## Style source

Primary style source: Excalidraw's extracted “Whiteboard Utility Flat” design DNA.

Mode: inspired by the reference, not a clone.

This design system replaces the earlier Mosaic Grid direction. Do not blend the two styles.

The product should feel like a living analyst's whiteboard: a wide near-white canvas, floating utility panels, hand-drawn headings and annotation arrows, rough diagram strokes, and one rationed indigo action. It must remain a usable learning application rather than imitate a drawing editor.

## Product context

The Decision Room is a static, browser-only learning game that teaches OLAP cubes through one connected Northstar Retail investigation.

Three sales reports disagree. The learner joins as a new analyst. Mira, the analytics lead, asks the learner to trace raw evidence, define the fact grain, build a star schema, create a cube, use every core OLAP operation, reproduce answers in SQL, repair analytical mistakes, and deliver a verified Decision Brief.

The course contains exactly 17 chapters, numbered Chapter 1 through Chapter 17.

Primary job:

“Help me build a correct and connected mental model of OLAP by manipulating one realistic example and tracing every result to evidence.”

## Experience principles

1. Treat the page as a working whiteboard, not a dashboard.
2. Handwriting makes explanations feel human; body text and SQL remain highly readable.
3. Every chapter adds one connected sketch to the larger mental model.
4. Every aggregate can reveal its source rows and SQL.
5. Game mechanics support progress without timers, lives, or penalties.
6. Missing data and measured zero remain visibly different.
7. Every drawing interaction has a keyboard and click alternative.

## Course architecture

Five connected acts:

1. Find the evidence — Chapters 1–3
2. Build the model — Chapters 4–7
3. Navigate the cube — Chapters 8–12
4. Protect the answer — Chapters 13–15
5. Prove and continue — Chapters 16–17

Each chapter uses:

Briefing → Explore → Build → Test → Debrief

All chapters are freely accessible. The recommended sequence is visible but never enforced through artificial locks.

## Whiteboard application shell

### Desktop

Use one edge-to-edge white canvas with three floating zones:

- Left floating chapter palette: 280 px
- Central working canvas: flexible, minimum 640 px
- Right evidence inspector: 360 px when open
- Top floating toolbar: chapter title, five-stage progress, XP, glossary
- Bottom floating navigation: Previous, chapter status, Continue

The canvas itself has no card background or shadow. Diagram objects sit directly on white. Floating UI panels use a pale lavender-gray surface or white with a restrained outline and soft shadow.

### Tablet

- Chapter palette becomes a drawer
- Evidence inspector becomes an overlay panel
- Whiteboard canvas remains the primary surface
- Stage controls wrap into two rows

### Mobile

- One-column scroll
- Sticky top utility bar
- Chapter palette and evidence open as full-height drawers
- Lesson, sketch interaction, evidence, quiz, and debrief stack in order
- The whiteboard becomes a bordered, horizontally scrollable stage where needed
- Tables scroll inside their own containers
- Continue stays reachable without covering content

## Reference-derived color system

Structural colors:

- Canvas: #FFFFFF
- Chrome surface: #ECECF4
- Primary ink: #1B1B1F
- Body ink: #000000
- Secondary text: #999999
- Muted text and neutral stroke: #B8B8B8
- Primary indigo: #6965DB
- Indigo hover: #5B57D1
- Indigo selection tint: #F1F0FF
- Indigo strong tint: #E0DFFF

Semantic sketch strokes, used only when meaning requires them:

- Verified green: #2F9E44
- Attention orange: #E67700
- Error red: #C92A2A

Color rules:

- The white canvas should occupy most of every screen.
- At most one solid indigo primary action is visible in a local interaction area.
- Repeated active states use the pale indigo tint, not repeated solid indigo fills.
- Semantic colors appear as thin strokes, small marks, and light tints rather than large panels.
- Never use gradients.
- Never use dark dashboard backgrounds.

## Typography

Handwritten layer:

- Preferred: Excalifont
- Fallbacks: Virgil, “Comic Sans MS”, “Bradley Hand”, cursive
- Use for chapter titles, diagram labels, annotation arrows, Mira's short notes, operation names on the whiteboard, and large learning takeaways.
- Do not use for paragraphs longer than three lines, dense table text, form controls, or SQL.

Readable interface layer:

- Assistant or Geist Sans, fallback system-ui, sans-serif
- Use for body lessons, buttons, navigation, quiz options, evidence tables, and accessibility labels.

Technical layer:

- Geist Mono or JetBrains Mono, fallback ui-monospace, monospace
- Use for SQL, keys, field names, cube coordinates, numeric checksums, and keyboard hints.

Type scale:

- Mission headline: hand font, clamp(48px, 7vw, 88px), line-height 0.9
- Chapter title: hand font, clamp(36px, 5vw, 60px), line-height 0.95
- Whiteboard object title: hand font, 24–32px
- Annotation: hand font, 16–20px
- Section heading: sans, 22px / 1.2, weight 700
- Body large: sans, 18px / 1.6
- Body: sans, 16px / 1.55
- Small interface: sans, 13px / 1.4
- Technical metadata: mono, 11px / 1.4, 0.04em tracking
- SQL: mono, 13px / 1.65

Maximum paragraph width: 68 characters.

## Spacing

Base unit: 4 px.

Use:

- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Floating panel padding: 16 or 20
- Whiteboard object gap: 24–48
- Major diagram gap: 64
- Mobile panel padding: 16

Leave open canvas around diagrams. Avoid filling every gap with a card.

## Shape, line, and depth

Control radius:

- Tight: 4 px
- Default: 6 px
- Primary: 8 px

Whiteboard objects:

- Use rough, slightly irregular outlines
- Combine 2 px ink strokes with a faint offset duplicate stroke
- Use imperfect oval highlights and hand-drawn underlines
- Use curved arrow connectors with arrowheads
- Diagram lines may vary by 1 px in offset or rotation to feel drawn
- Keep text and hit areas geometrically aligned even when strokes look rough

CSS sketch treatment:

- Use border-radius values with unequal horizontal and vertical radii
- Use ::before or ::after for a lightly offset second outline
- Rotate decorative strokes no more than ±1.2 degrees
- Keep input fields, tables, and buttons structurally straight

Depth:

- No shadow on the canvas
- Crisp floating-control ring: 0 0 0 1px #FFFFFF
- Floating panel shadow only: 0 0 1px rgba(0,0,0,.17), 0 0 3px rgba(0,0,0,.08), 0 7px 14px rgba(0,0,0,.05)
- Do not use glassmorphism or blur

## Core components

### ChapterPalette

- Floating white panel at the left edge
- 17 chapters grouped into five acts
- Compact numbered rows
- Current chapter uses Indigo tint and a hand-drawn oval around its number
- Completed chapter uses a green check stroke and the word “done”
- Visible title on desktop; collapsible on smaller screens
- Full-row target at least 44 px

### TopToolBar

- Floating white toolbar, 8 px radius
- Chapter number and title on the left
- Five-stage progress in the middle
- XP, glossary, and settings on the right
- Active stage uses Indigo tint
- Labels remain sans or mono, not handwritten

### MentorNote

- Short handwritten note from Mira
- No card background when placed on the whiteboard
- Curved gray arrow points at the relevant object
- Longer explanation appears in readable sans beneath it

### WhiteboardStage

- Pure white canvas
- Generous empty space
- Learning objects arranged as a connected sketch
- Optional faint dot grid at 3% neutral opacity
- Selection toolbar appears near the chosen object
- Has an accessible structured-list or table equivalent

### RawTableSketch

- Real semantic table with straight rows
- Handwritten annotation arrows identify primary key, foreign key, and grain
- Selected related rows use Indigo tint
- Cancelled row receives a rough red strike and readable “excluded” label

### StarSchemaSketch

- Fact Sales centered in a rough rectangular outline
- Date, Product, Store, and Customer arranged around it
- Curved or slightly irregular join lines
- Correct joins use solid ink; incomplete joins use dashed neutral
- Fields use monospace
- Titles use hand font

### CubeExplorer

- Prefer a layered 2D matrix or hand-sketched isometric cube whose labels stay clear
- Month, Region, and Category axes are explicit
- Active coordinate has a hand-drawn Indigo oval and selection tint
- Active value appears as large handwritten ₹6,600
- A curved evidence arrow traces to the source rows
- Missing cells display an em dash and “no matching fact”
- Measured zero displays ₹0 and “measured zero”
- Always provide a table alternative

### SQLWorkbench

- Floating white panel with straight border and soft panel shadow
- SQL remains crisp monospace, never handwritten
- Line numbers in muted gray
- Keywords Indigo
- Strings green
- Numbers primary ink
- Run query is the single solid Indigo action in this region
- Result strip shows a handwritten check and sans checksum

### EvidenceInspector

- Floating panel on the right
- Tabs: Raw rows, Star model, SQL, Checks
- Active tab uses Indigo tint and a short hand-drawn underline
- Numeric values align right
- Inspector can dock, float, or become a mobile drawer

### QuizCard

- White floating panel
- Question title may use the hand font
- Answer text uses sans
- Large radio-card targets
- Selected answer uses Indigo border and tint
- Correct answer gets a rough green check plus “Correct”
- Incorrect answer gets a rough red cross plus “Not quite”
- Explanation remains available
- No timer or penalty UI

### ChecksumNote

- Looks like a pinned whiteboard note
- Label in mono
- Value large and handwritten
- Verification state uses a green stroke and readable “verified”
- Shows expected and actual numbers

### DecisionBrief

- Printable white sheet floating over the canvas
- Structured rows: Claim, Measure, Filters, SQL, Evidence, Caveat
- Small handwritten annotations connect each row to a course chapter
- Verified rows get green check strokes
- Main content remains readable sans and mono

### CompletionSheet

- White sheet with Indigo outline
- Large handwritten “Case closed”
- Decision Architect badge as a rough Gold/Orange seal
- 17 of 17 chapters
- Trusted checksum
- Chosen next mission

## Mission overview

Headline:

“The reports disagree. Find the number we can trust.”

Composition:

- Vast white canvas
- Handwritten headline near the center-left
- Mira's curved arrow pointing to Start mission
- 17-node hand-drawn chapter path grouped into five acts
- Floating progress palette
- Northstar checksum note: 10 facts · 14 units · ₹19,800 net
- One solid Indigo Start or Resume action
- Browser-only progress note

The chapter path should look like a connected analytical sketch, not a list of school lessons.

## Chapter workspace

The workspace shows:

- Chapter palette
- Top toolbar
- Short Mira note
- Main whiteboard interaction
- Evidence inspector
- Five-stage status
- Previous and Continue
- Decision Brief shortcut

The learner must immediately understand:

- what the current question is
- what can be manipulated
- which object is selected
- where its number came from
- what to do next

## Chapter 7 reference state

Design the first draft around Chapter 7, Create the First Cube.

Required state:

- Explore stage active
- Month, Region, and Category coordinate controls
- selected coordinate: February · North · Home
- selected aggregate: ₹6,600
- two contributing fact rows in the evidence inspector
- one visible missing cell shown as em dash
- handwritten Mira annotation: “A blank cell is not automatically zero”
- trace line: raw rows → fact → dimension labels → cube cell → ₹6,600
- Previous and Continue actions
- 17-chapter palette visible

## Interaction catalog

Each chapter adds one whiteboard interaction:

1. Sort OLTP and OLAP questions.
2. Follow linked raw-table rows.
3. Change the fact grain and observe duplication.
4. Build the star schema.
5. Arrange hierarchy levels.
6. Classify measure additivity.
7. Explore cube coordinates.
8. Assemble SQL.
9. Apply slice and dice.
10. Roll up and drill down.
11. Pivot and drill through.
12. Generate eight grouping patterns.
13. Repair analytical traps.
14. Compare ROLAP, MOLAP, and HOLAP.
15. Tune performance and run quality checks.
16. Assemble the Decision Brief.
17. Rebuild the complete knowledge map.

Drag interactions always provide click-to-select and keyboard equivalents.

## Motion

Use calm 140–500 ms ease-in-out transitions.

Motion should resemble objects being arranged on a whiteboard:

- connector line draws from one object to another
- selection oval traces once
- rows slide together during roll-up
- rows separate during drill-down
- row and column labels rotate during pivot
- a green check draws when evidence reconciles

No bouncing, confetti, perpetual floating, or distracting drawing loops.

Respect prefers-reduced-motion and provide instant equivalent state changes.

## Accessibility

- WCAG AA contrast
- Semantic landmarks and heading order
- Visible keyboard focus
- 44 px minimum targets where practical
- Icons plus words for status
- Polite live-region feedback
- Complete keyboard support
- No timed tasks
- No drag-only tasks
- Usable at 200% zoom
- Semantic tables for data
- Table or list equivalents for cube and diagram views
- Handwriting never carries essential information alone
- Body, controls, evidence, and SQL remain in readable sans or mono fonts

## Content invariants

Northstar checksums:

- 6 raw orders
- 11 raw order lines
- 10 completed facts
- 14 completed units
- ₹21,150 gross
- ₹1,350 discounts
- ₹19,800 net
- cancelled order 1006 contains ₹6,000 and is excluded

Chapter 7 active cell:

- February
- North
- Home
- ₹6,600
- two source fact rows

Never convert an unobserved cube cell to zero. Use an em dash and “No matching fact.”

## Hard constraints

Use ONLY the fonts, colors, spacing, and component styles defined here.

Do not introduce:

- the previous Mosaic Grid style
- dark dashboard chrome
- gradients
- glassmorphism
- stock photography
- glossy 3D cubes
- generic SaaS cards
- a fantasy game interface
- a childish classroom theme
- handwritten paragraphs, SQL, table cells, or small controls
- more than one solid Indigo primary action in one local region

The final effect should be “an analyst teaching on an interactive whiteboard,” not “a drawing tool clone.”
