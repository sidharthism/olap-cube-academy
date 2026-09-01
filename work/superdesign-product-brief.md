# Superdesign Product Brief — The Decision Room

## Deliverable

Design a polished, responsive, static learning game called “The Decision Room.” It teaches OLAP cubes from raw retail tables through dimensional modeling, SQL, cube operations, trustworthy analysis, and a final Decision Brief.

The design must support exactly 17 chapters numbered Chapter 1 through Chapter 17.

The experience should feel like a calm professional investigation unfolding on an analyst's interactive whiteboard. It must not feel like a children's quiz app, a fantasy role-playing game, a drawing-tool clone, or a generic corporate dashboard.

## Primary user

A beginner or early-career analyst who has heard terms such as cube, fact, dimension, slice, or drill-down but does not yet have a connected mental model.

The user needs:

- plain language
- a visible learning path
- visual explanations connected to one stable example
- opportunities to manipulate the data
- immediate quiz explanations
- confidence that every displayed number can be traced to source rows and SQL

## Core story

Northstar Retail has three sales reports that disagree. The learner joins as a new analyst. Mira, the analytics lead, gives one mission:

> Find the number we can trust, show how it was built, and make it easy to explore.

Every chapter repairs one part of the reporting process. The learner finishes with a verified Decision Brief and chooses a next learning path.

## Exact course structure

Act 1 — Find the evidence:

1. Enter the Decision Room
2. Read the Raw Evidence
3. Define One Fact

Act 2 — Build the model:

4. Build the Star
5. Describe the Business
6. Choose Measures Carefully
7. Create the First Cube

Act 3 — Navigate the cube:

8. Ask with SQL
9. Slice and Dice
10. Roll Up and Drill Down
11. Pivot and Drill Through
12. Ask for Every Subtotal

Act 4 — Protect the answer:

13. Avoid Analytical Traps
14. Choose an OLAP Engine
15. Make It Fast and Trustworthy

Act 5 — Prove and continue:

16. Leadership Review
17. Close the Case and Choose the Next Mission

## Learning loop

Every chapter uses the same five stages:

1. Briefing — one short story problem.
2. Explore — a visual or linked table.
3. Build — one focused learner action.
4. Test — a quiz with immediate explanation and unlimited retries.
5. Debrief — one durable takeaway added to the Decision Brief.

The chapter shell must make the current stage obvious without forcing the learner through artificial locks. All chapters remain freely accessible.

## Key screens to design

### 1. Mission overview

Hero message:

“The reports disagree. Find the number we can trust.”

Required elements:

- Start mission or Resume mission primary action
- 17-chapter map grouped into the five acts
- current chapter, total XP, badges, and completion percentage
- trusted Northstar checksum teaser: 10 facts · 14 units · ₹19,800 net sales
- short introduction from Mira
- View raw evidence secondary action
- clear note that progress is saved only in this browser

The chapter map should feel like a connected investigation board or analytical system map, not a vertical list of school lessons. It must still have a semantic list and work by keyboard.

### 2. Chapter learning stage

Desktop shell:

- 272–304 px mission rail on the left
- compact top bar with chapter number, title, XP, progress, glossary, and settings
- central learning stage for lesson and interaction
- collapsible evidence panel on the right for raw rows, model, SQL, and checks
- persistent lower action row for Previous, current five-stage status, and Continue

Small-screen shell:

- mission rail becomes a labelled drawer
- top bar keeps chapter title, progress, and menu
- lesson, interaction, and evidence stack in that order
- the primary Continue action remains visible without covering content

### 3. Quiz state

Required elements:

- one question at a time
- clear progress such as Question 2 of 3
- large radio-card answers
- Submit answer before feedback
- selected-answer state, correct state, and incorrect state that do not rely on color alone
- short explanation after submission
- Retry question and Continue actions
- chapter mastery summary at the end
- no countdown, lives, penalties, or streak pressure

### 4. Decision Brief

The brief grows across the course and contains:

- business claim
- metric and filters
- calculation or SQL
- source evidence
- caveat
- verified checksum

It can appear as a right-side drawer during lessons and as a printable document in Chapter 16.

### 5. Chapter 17 knowledge map

Show the complete chain:

Raw events → declared-grain facts → dimensions and hierarchies → defined measures → cube cells → OLAP operations → SQL and checks → Decision Brief.

The learner arranges the chain, completes an operation recap, chooses a further-learning path, and receives the Decision Architect badge.

## Interaction catalog

Each chapter must have one meaningful visual interaction:

1. Question sorter — OLTP versus OLAP
2. Linked-table explorer — follow keys across raw tables
3. Grain simulator — compare order, line, and summary row meanings
4. Star builder — connect four dimensions to Fact Sales
5. Hierarchy ladder — Year, Quarter, Month, Day
6. Measure gates — additive, semi-additive, non-additive
7. Cube explorer — Month × Region × Category cells
8. SQL block builder — assemble the grouping query
9. Filter lab — slice and dice
10. Hierarchy elevator — roll-up and drill-down
11. Pivot and drill-through lab
12. Grouping-set generator — eight CUBE patterns
13. Analytical error clinic
14. ROLAP, MOLAP, and HOLAP trade-off simulator
15. Performance and quality control room
16. Decision Brief builder
17. Complete knowledge map and next-mission selector

No interaction may depend on drag alone. Provide click-to-select and keyboard alternatives.

## Shared data that must appear

Northstar Retail:

- 3 customers
- 4 products
- 3 stores
- 6 raw orders
- 11 raw order lines
- 5 completed orders
- 10 completed fact rows
- 14 completed units
- gross sales ₹21,150
- discounts ₹1,350
- completed net sales ₹19,800
- cancelled order 1006 contains ₹6,000 and is excluded

The visual cube has Month, Region, and Category coordinates. Observed cells:

- January · South · Apparel = ₹900
- January · South · Home = ₹1,200
- January · West · Apparel = ₹1,600
- January · West · Home = ₹2,700
- February · South · Apparel = ₹3,300
- February · North · Home = ₹6,600
- April · West · Apparel = ₹500
- April · West · Home = ₹3,000

Unobserved combinations display an em dash. They must never be silently displayed as ₹0.

## Visual language

Mood:

- Excalidraw-inspired interactive analyst whiteboard
- evidence, coordinates, and linked systems drawn as one connected sketch
- serious but welcoming
- precise without feeling mechanical

Palette direction:

- near-white canvas
- pale lavender-gray floating controls
- near-black drawing ink
- rationed indigo for the primary action and selection
- green strokes for reconciled evidence
- orange strokes for questions and attention
- red strokes only for genuine errors

Avoid:

- decorative gradients
- neon cyberpunk overload
- glassmorphism that lowers contrast
- cartoon avatars
- trophy clutter
- dense dashboard walls
- tiny monospace text
- using only color to show correctness

Typography:

- Excalifont-style handwriting for chapter titles, diagram labels, Mira notes, and short learning takeaways
- highly readable sans-serif for lessons, controls, quizzes, and tables
- legible monospace for SQL, keys, and numeric evidence
- strong numeric alignment for currency and totals
- generous line height and short reading widths
- never use handwriting for paragraphs, SQL, table cells, or small controls

Graphic motifs:

- rough rectangles and imperfect selection ovals
- curved annotation arrows
- connected chapter nodes
- fact-to-dimension sketch lines
- cube faces used only where they teach a concept
- hand-drawn verification checks

Use code-native CSS and simple line work rather than stock photography.

## Component system

Required reusable components:

- AppShell
- MissionRail
- ActGroup
- ChapterNode
- ProgressRing
- XPBadge
- MentorBriefing
- LessonCard
- TermTooltip
- InteractionStage
- EvidenceDrawer
- EvidenceTabs
- RawDataTable
- StarSchemaDiagram
- CubeGrid
- SQLWorkbench
- ChecksumCard
- QuizCard
- FeedbackPanel
- DebriefCard
- DecisionBriefDrawer
- NextMissionCard
- CompletionCard

Component states must cover default, hover, focus, selected, completed, verified, warning, error, locked-by-dependency if ever used, and disabled.

## Chapter 7 reference frame

Create one detailed chapter frame using Chapter 7, Create the First Cube:

- briefing: “Turn completed facts into a view leaders can explore.”
- three coordinate selectors for Month, Region, and Category
- cube or layered-grid visual with the active cell clearly highlighted
- selected coordinate: February · North · Home
- active value: ₹6,600
- evidence drawer showing two fact rows that sum to ₹6,600
- a visible missing cell rendered as an em dash with an explanation
- five-stage chapter progress showing Explore or Build active
- Previous and Continue controls

This frame is the strongest test of whether the design supports teaching rather than merely displaying metrics.

## State and progress behavior

All state remains local to the browser:

- completed interaction per chapter
- best quiz score per chapter
- completed debrief per chapter
- total XP
- earned badges
- current chapter
- chosen further-learning path

Required controls:

- Export progress as JSON
- Import progress from JSON with validation
- Reset progress with confirmation
- Review any completed chapter

Never require an account, backend, secret, or network request to learn the course.

## Static navigation

Use static-host-safe navigation. Hash-based chapter locations are acceptable:

- /#/home
- /#/chapter/1
- /#/chapter/17

Opening or refreshing a chapter URL must preserve the requested chapter on a basic static host.

## Accessibility

- semantic landmarks and heading order
- semantic data tables for every graphical table or cube
- complete keyboard operation and visible focus
- 44 px target size where practical
- WCAG AA text and control contrast
- status icons and words in addition to color
- polite live-region announcements for interaction and quiz feedback
- reduced-motion mode
- usable at 200% browser zoom
- horizontal table scrolling inside its own region
- no timed tasks
- no drag-only tasks
- explanations remain available after attempts

## Responsive behavior

Design at least:

- 1440 px desktop
- 1024 px compact desktop or tablet landscape
- 768 px tablet portrait
- 390 px mobile

The mobile view must remain a complete learning experience. Do not hide SQL, evidence, or quiz explanations; move them into drawers or stacked sections.

## Motion

Motion exists only to teach or orient:

- rows combine during roll-up
- groups separate during drill-down
- row and column headers rotate during pivot
- a verified line traces from an aggregate cell to source facts
- progress nodes settle into completed state

Respect prefers-reduced-motion and use instant state changes when enabled.

## First design draft request

Produce a coherent design direction with:

1. the mission overview at desktop size
2. the Chapter 7 reference frame at desktop size
3. the Chapter 7 frame adapted to mobile
4. a compact component and color sample

The design must make these relationships immediately understandable:

raw rows → fact table → dimensions → cube coordinate → aggregate → SQL → source evidence.

## Definition of a successful design

The design succeeds when a beginner can answer these questions without explanation from the designer:

- Where am I in the 17-chapter journey?
- What business problem am I solving now?
- What can I manipulate?
- Which number is currently selected?
- Where did that number come from?
- What is missing versus measured zero?
- What do I do next?
- How can I review or retry?

The visual direction should be distinctive enough to feel like a connected investigation, but quiet enough that data, SQL, and explanations remain the focus.
