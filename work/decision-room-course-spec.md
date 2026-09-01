# The Decision Room — OLAP Cube Academy

## Product promise

The learner joins Northstar Retail as a new data analyst. Leaders have three reports that disagree about sales. The learner must trace the raw evidence, design a trustworthy analytical model, learn every core OLAP operation, and finally present one defensible Decision Brief.

The experience must feel like a professional investigation, not a children's game. Language stays simple, every new term is explained, and every visual has a keyboard-friendly alternative.

## Audience and outcomes

The course assumes the learner knows little or nothing about OLAP. By the end, the learner should be able to:

1. Explain why transaction tables and analytical models serve different jobs.
2. Identify facts, dimensions, measures, grain, members, levels, and hierarchies.
3. Turn raw order tables into a star schema without double-counting.
4. Read a three-dimensional cube and understand that a cube can have more than three dimensions.
5. Write SQL for slice, dice, roll-up, drill-down, pivot, drill-through, and full subtotal combinations.
6. Explain additive, semi-additive, and non-additive measures.
7. Distinguish a missing cell from a true zero.
8. Choose between ROLAP, MOLAP, and HOLAP at a basic practical level.
9. Recognize correctness and performance traps.
10. Answer a business question with traceable evidence.

## Story

Northstar Retail sells Apparel and Home products through North, South, and West stores. Mira, the analytics lead, gives the learner a mission:

> “Find the number we can trust, show how it was built, and make it easy to explore.”

Each chapter repairs one part of the broken reporting process. The final report becomes trustworthy only when all earlier decisions — grain, joins, measures, aggregation, and missing-value meaning — are correct.

## Core learning loop

Every chapter follows the same five-beat loop:

1. Briefing — a short business problem.
2. Explore — a visual or table that can be manipulated.
3. Build — one focused learner action.
4. Test — a small quiz with immediate explanations.
5. Debrief — a one-sentence takeaway and the evidence added to the Decision Brief.

Chapters are shown in a recommended sequence but remain freely accessible. Progress, quiz attempts, and earned badges are saved in localStorage. A visible Reset progress control must require confirmation.

## Game systems

- 100 XP per chapter: 40 for completing the interaction, 40 for the quiz, 20 for reading the debrief.
- Quiz mastery requires 80%, but retries are unlimited and never reduce XP.
- Badges: Evidence Reader, Grain Keeper, Star Builder, Measure Guardian, Cube Navigator, SQL Explorer, Trap Spotter, and Decision Lead.
- A Decision Brief panel fills in as the learner proves totals and explains model choices.
- No timers, streak pressure, lives, penalties, or inaccessible drag-only mechanics.
- Every drag interaction also offers click-to-select and keyboard controls.

## Stable practice dataset

All chapters use the same tiny retail dataset:

- 3 customers
- 4 products
- 3 stores
- 6 raw orders
- 11 raw order lines
- 5 completed orders
- 10 completed sales facts
- 14 completed units
- Gross sales: ₹21,150
- Discounts: ₹1,350
- Net sales: ₹19,800
- Cancelled order 1006 contains a ₹6,000 Kettle line and must not enter completed-sales facts.

These constants are the course's checksum. Any implementation that produces different completed totals is wrong.

## Chapter map

### Chapter 1 — Enter the Decision Room

Story beat: three reports disagree because one is designed for taking orders, one is a spreadsheet copy, and one is an analytical summary.

Learn:

- OLTP means Online Transaction Processing. It records individual business events quickly and safely.
- OLAP means Online Analytical Processing. It helps people compare many events across time and business categories.
- OLAP grew from management-information systems, relational databases, and the need for fast multidimensional analysis.
- A cube is a mental and computational model, not necessarily a literal physical cube.

Interaction: sort six questions into “run the business now” or “understand the business over time.”

Questions:

- “Did order 1001 save?” → transaction/OLTP
- “Which region grew most by quarter?” → analysis/OLAP
- “Change a delivery address.” → transaction/OLTP
- “Compare categories across regions and months.” → analysis/OLAP

Quiz:

1. Which system is optimized for recording one order? Answer: OLTP. Explanation: it handles small, frequent writes.
2. Which system is optimized for comparing years and regions? Answer: OLAP. Explanation: it scans and summarizes many records.
3. True or false: an OLAP cube must be drawn with exactly three axes. Answer: false. Explanation: real models can have many dimensions.

Debrief: OLTP captures events; OLAP turns many events into comparable evidence.

### Chapter 2 — Read the Raw Evidence

Story beat: Mira hands over five linked raw tables and warns that an order header is not a sold item.

Learn:

- A table represents one kind of thing or event.
- A primary key uniquely identifies a row.
- A foreign key connects one table to another.
- Order headers and order lines have different grains.
- A cancelled order can exist in source data without counting as completed sales.

Interaction: click order 1002 and watch its customer, store, and two order lines highlight across tables. Then inspect cancelled order 1006.

Quiz:

1. Where is product quantity stored? Answer: order lines.
2. Why can one order appear on several order-line rows? Answer: it contains several products.
3. Should order 1006 count toward completed net sales? Answer: no, because its status is cancelled.

Debrief: before aggregating, follow the keys and understand what one row means.

### Chapter 3 — Define One Fact

Story beat: an early report joins orders to lines and accidentally counts orders more than once.

Learn:

- Grain is the exact meaning of one row.
- The course fact grain is “one product line on one completed order.”
- Measures must match that grain.
- Mixing grains creates duplication and misleading totals.

Interaction: choose a candidate grain, then preview how the same order appears at order, order-line, and daily-summary grains.

Build check:

- Correct grain: one completed order line.
- Fact key: order_id plus line_no.
- Exclude cancelled orders before loading facts.

Quiz:

1. What should be decided before selecting measures? Answer: grain.
2. Can order total be repeated on every line and safely summed? Answer: no.
3. At the selected grain, what does one row describe? Answer: one product line on one completed order.

Debrief: grain is the contract that keeps every number honest.

### Chapter 4 — Build the Star

Story beat: the raw operational tables are correct but awkward for repeated analysis.

Learn:

- A fact table stores measurable business events.
- Dimension tables describe the event.
- A star schema places one fact table in the center and dimensions around it.
- Surrogate keys give warehouse-controlled identities.
- A denormalized dimension may repeat descriptive text to simplify analysis.

Interaction: place Date, Product, Store, and Customer around Fact Sales. Invalid placements explain why they are wrong.

Required star:

- fact_sales: date_key, product_key, store_key, customer_key, order_id, line_no, quantity, gross_amount, discount_amount, net_amount
- dim_date: date, day, month, quarter, year
- dim_product: product, category
- dim_store: store, region
- dim_customer: customer, city

Quiz:

1. Where does net_amount belong? Answer: fact_sales.
2. Where does category belong? Answer: dim_product.
3. Why is the shape called a star? Answer: descriptive dimensions surround a central fact table.

Debrief: the star makes common analytical joins predictable.

### Chapter 5 — Describe the Business

Story beat: the star has tables, but the learner still needs a vocabulary for navigating them.

Learn:

- Dimension: an angle for analysis, such as Time, Product, or Store.
- Member: one value in a dimension, such as February or South.
- Level: one step of detail, such as Month.
- Hierarchy: an ordered path, such as Year → Quarter → Month → Day.
- Attribute: a descriptive field used for filtering or display.

Interaction: climb hierarchy ladders and classify labels as dimension, member, level, or measure.

Quiz:

1. In Year → Quarter → Month, what is Quarter? Answer: a level.
2. In the Store dimension, what is South? Answer: a member.
3. What enables consistent roll-up and drill-down? Answer: a hierarchy.

Debrief: dimensions provide the coordinates; hierarchies provide the route between detail levels.

### Chapter 6 — Choose Measures Carefully

Story beat: a dashboard sums percentages and produces nonsense.

Learn:

- Additive measures can be summed across all relevant dimensions: quantity and net sales.
- Semi-additive measures can be summed across some dimensions but not time: account balance or inventory snapshot.
- Non-additive measures should not be summed: margin percentage, averages, and ratios.
- Derived ratios should usually be recalculated from their components after aggregation.

Interaction: send measures through “sum safely,” “sum with limits,” or “recalculate” gates.

Quiz:

1. Is net sales additive in this dataset? Answer: yes.
2. Should monthly margin percentages be added to get a quarter margin? Answer: no.
3. How should quarter average selling price be found? Answer: aggregate sales and units, then divide.

Debrief: the aggregation rule is part of a measure's definition.

### Chapter 7 — Create the First Cube

Story beat: the learner turns facts into a navigable Month × Region × Category view.

Learn:

- A cube cell is found by choosing one member from each displayed dimension.
- The cell stores an aggregated measure, here SUM(net_amount).
- Extra dimensions can act as filters even when not drawn as axes.
- Precomputed aggregates trade storage and refresh work for faster reads.

Interaction: select Month, Region, and Category coordinates; the corresponding cell glows and shows its contributing fact rows.

Known populated cells:

- Jan × South × Apparel = ₹900
- Jan × South × Home = ₹1,200
- Jan × West × Apparel = ₹1,600
- Jan × West × Home = ₹2,700
- Feb × South × Apparel = ₹3,300
- Feb × North × Home = ₹6,600
- Apr × West × Apparel = ₹500
- Apr × West × Home = ₹3,000

All other displayed combinations are missing and must render as an em dash, not zero.

Quiz:

1. What is the measure in the practice cube? Answer: net sales.
2. What identifies one cell? Answer: one member from every displayed dimension.
3. Does a blank March cell prove sales were zero? Answer: no; it may mean no fact row was recorded.

Debrief: a cube is a fast way to navigate grouped facts using business coordinates.

### Chapter 8 — Ask with SQL

Story beat: the visual cube is convenient, but every result needs a reproducible query.

Learn:

- JOIN attaches descriptive dimension values to facts.
- WHERE filters source rows before grouping.
- GROUP BY creates one result group for each selected dimension combination.
- SUM calculates the measure for each group.
- HAVING filters groups after aggregation.

Interaction: assemble a SQL query from ordered blocks and run it against the fixed dataset.

Core query:

~~~sql
SELECT
  d.month_name,
  s.region,
  p.category,
  SUM(f.net_amount) AS net_sales
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_store AS s ON s.store_key = f.store_key
JOIN dim_product AS p ON p.product_key = f.product_key
GROUP BY d.month_number, d.month_name, s.region, p.category
ORDER BY d.month_number, s.region, p.category;
~~~

Quiz:

1. Which clause creates Month × Region × Category groups? Answer: GROUP BY.
2. Which clause removes rows before aggregation? Answer: WHERE.
3. Which clause can keep only groups above ₹2,000? Answer: HAVING.

Debrief: SQL makes the cube's grouping logic visible and repeatable.

### Chapter 9 — Slice and Dice

Story beat: Mira asks for one focused view, then a small analytical sub-cube.

Learn:

- Slice fixes one dimension to one member and reduces the visible space.
- Dice selects ranges or sets across several dimensions.
- Filtering does not automatically change the grain of the remaining result.

Interaction:

- Slice: Month = February.
- Dice: Month in January/February, Region in South/West, Category = Apparel.
- A breadcrumb always shows active filters.

Expected slice result for February: South Apparel ₹3,300; North Home ₹6,600.

Quiz:

1. “Only February” is which operation? Answer: slice.
2. “Jan or Feb, South or West, Apparel only” is which operation? Answer: dice.
3. Does a dice operation require a literal three-dimensional cube? Answer: no.

Debrief: slice focuses one coordinate; dice selects a smaller multidimensional region.

### Chapter 10 — Roll Up and Drill Down

Story beat: leadership starts with quarters, then asks what caused the quarter result.

Learn:

- Roll-up moves to a higher, more summarized hierarchy level.
- Drill-down moves to a lower, more detailed hierarchy level.
- Correct date hierarchies prevent January from different years being mixed.
- Totals must reconcile when moving between levels.

Interaction: use a hierarchy elevator: Day ↔ Month ↔ Quarter ↔ Year. Each move animates the same facts combining or separating.

Expected:

- January net sales = ₹6,400
- February net sales = ₹9,900
- Q1 net sales = ₹16,300
- February exceeds January by ₹3,500

Quiz:

1. Month → Quarter is what? Answer: roll-up.
2. Quarter → Month is what? Answer: drill-down.
3. Should Q1 equal the sum of its displayed months? Answer: yes, for this additive measure.

Debrief: roll-up changes the level of detail; drill-down reveals the contributors.

### Chapter 11 — Pivot and Drill Through

Story beat: one manager wants regions in rows, another wants them in columns, and finance wants the source lines.

Learn:

- Pivot rotates the presentation without changing the underlying facts.
- Drill-through leaves the aggregate and opens the detailed fact records behind one cell.
- Drill-through is different from drill-down: detail rows are not merely the next hierarchy level.

Interaction:

- Pivot Month and Region between rows and columns.
- Open the February × North × Home cell to reveal its two fact rows.

Quiz:

1. Does pivot change net sales? Answer: no.
2. What opens the fact rows behind ₹6,600? Answer: drill-through.
3. Is drill-through the same as Month → Day? Answer: no.

Debrief: pivot changes viewpoint; drill-through exposes evidence.

### Chapter 12 — Ask for Every Subtotal

Story beat: the executive view needs detail rows, subtotals, and a grand total in one result.

Learn:

- GROUP BY CUBE produces every subtotal combination for selected dimensions.
- ROLLUP produces hierarchical prefix subtotals rather than every possible combination.
- GROUPING SETS explicitly lists wanted groupings.
- Subtotal rows need clear labels because NULL can mean “all members” or genuine missing data.

Interaction: toggle three grouping switches and see the generated grouping sets. For three dimensions, the full cube has 2³ = 8 grouping-set patterns.

Reference syntax for engines that support it:

~~~sql
SELECT
  d.month_name,
  s.region,
  p.category,
  SUM(f.net_amount) AS net_sales
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_store AS s ON s.store_key = f.store_key
JOIN dim_product AS p ON p.product_key = f.product_key
GROUP BY CUBE (d.month_name, s.region, p.category);
~~~

Quiz:

1. With three grouped dimensions, how many subtotal patterns can a full CUBE create? Answer: eight.
2. Which construct explicitly names only wanted combinations? Answer: GROUPING SETS.
3. Why should subtotal NULLs be labelled? Answer: to distinguish “all members” from missing data.

Debrief: SQL cube operators generate coordinated detail, subtotal, and grand-total views.

### Chapter 13 — Avoid Analytical Traps

Story beat: the learner reviews four reports that look plausible but are wrong.

Learn:

- Fan-out joins duplicate facts.
- Repeated header totals cause double-counting at line grain.
- Missing and zero carry different meanings.
- Slowly changing dimensions require history rules.
- Ratios must be recomputed at the requested level.
- Filters placed on the wrong side of an outer join can silently remove empty groups.

Interaction: an error clinic presents a broken result, query, and symptom. The learner identifies the cause and applies one repair.

Required cases:

1. Cancelled order included → total incorrectly becomes ₹25,800.
2. Missing cells filled with zero → “no observation” becomes a false business claim.
3. Average of group averages → groups receive equal weight despite different sizes.
4. Fact joined to a non-unique dimension key → duplicated sales.

Quiz:

1. What proves a dimension join is safe? Answer: one matching dimension row for each fact key version.
2. Is no row automatically equal to zero? Answer: no.
3. Why is average-of-averages risky? Answer: it ignores different group sizes.

Debrief: a fast wrong cube is still wrong; correctness starts with data meaning.

### Chapter 14 — Choose an OLAP Engine

Story beat: Northstar must decide how aggregates should be stored and calculated.

Learn:

- ROLAP keeps facts in relational tables and uses SQL for analysis. It scales and stays close to detailed data.
- MOLAP stores precomputed multidimensional structures. Reads can be very fast, but processing and storage cost more.
- HOLAP combines relational detail with multidimensional aggregates.
- Modern columnar and cloud engines blur old boundaries, but the trade-offs still matter.

Interaction: change data size, freshness, query speed, and drill-through needs; observe which design becomes more suitable.

Quiz:

1. Which approach keeps detailed facts primarily in relational tables? Answer: ROLAP.
2. Which approach emphasizes precomputed multidimensional storage? Answer: MOLAP.
3. Which approach combines relational detail and multidimensional aggregates? Answer: HOLAP.

Debrief: engine choice balances freshness, scale, speed, storage, and detail access.

### Chapter 15 — Make It Fast and Trustworthy

Story beat: the correct report is too slow and the daily refresh sometimes arrives late.

Learn:

- Partitioning limits the data scanned.
- Columnar storage reads only needed columns efficiently.
- Materialized views or aggregate tables precompute common answers.
- Incremental processing updates only changed partitions.
- Semantic layers keep measure definitions consistent.
- Quality checks verify row counts, key uniqueness, freshness, reconciliation, and accepted values.

Interaction: a control room shows query latency and trust indicators. The learner applies a partition, aggregate, or quality check and sees the effect.

Mandatory checks:

- fact grain key order_id + line_no is unique
- all foreign keys resolve
- only completed orders load
- fact count is 10
- quantity is 14
- gross minus discount equals net on every row
- gross total is ₹21,150
- discount total is ₹1,350
- net total is ₹19,800

Quiz:

1. What reduces scanning when queries filter by date? Answer: date partitioning.
2. What keeps “net sales” defined once for every dashboard? Answer: a semantic layer or governed metric definition.
3. What should happen if a checksum fails? Answer: stop or quarantine the bad refresh and investigate.

Debrief: performance earns attention; quality earns trust.

### Chapter 16 — Leadership Review

Story beat: the learner must settle the disagreement and present a traceable conclusion.

Final mission:

1. State the fact grain.
2. Exclude the cancelled order.
3. Reconcile completed net sales to ₹19,800.
4. Compare January ₹6,400 with February ₹9,900.
5. Explain that February is ₹3,500 higher.
6. Roll Q1 up to ₹16,300.
7. Split Q1 by region: North ₹6,600, South ₹5,400, West ₹4,300.
8. Split Q1 by category: Home ₹10,500, Apparel ₹5,800.
9. Drill through from a chosen cube cell to its fact rows.
10. Explain one missing-versus-zero risk and one performance choice.

Interaction: assemble the Decision Brief from claim, evidence, query, and caveat cards. The final brief is printable and can be copied as plain text.

Final quiz:

1. Which design decision protects every later total? Answer: fact grain.
2. Which operation produced the Q1 summary? Answer: roll-up.
3. Which feature proves where one aggregate came from? Answer: drill-through plus its reproducible SQL.
4. What is Northstar's trusted completed net-sales total? Answer: ₹19,800.

Debrief: a trustworthy analytical answer connects business meaning, model design, calculation, and source evidence.

### Chapter 17 — Close the Case and Choose the Next Mission

Story beat: leadership accepts the Decision Brief. Mira asks the learner to rebuild the whole idea from memory, explain the final conclusions in plain language, and choose what to learn next.

Purpose: this is a dedicated summary, conclusion, and further-learning chapter. It does not introduce another reporting problem. It helps the learner turn separate lessons into one reusable mental model.

#### Part A — The complete OLAP story in one view

The learner rebuilds this chain by arranging eight connected cards:

1. Business events happen.
2. OLTP tables record the events.
3. We define the grain of one analytical fact.
4. Facts connect to descriptive dimensions in a star schema.
5. Measures state what number is being analyzed and how it may aggregate.
6. Hierarchies organize dimensions from summary to detail.
7. A cube groups measures by combinations of dimension members.
8. OLAP operations and SQL let people navigate, compare, and verify the result.

When the order is correct, the cards transform into one concept map:

~~~text
Raw events
    ↓ clean and filter
Fact at a declared grain
    ↓ connect
Dimensions + hierarchies
    ↓ aggregate a defined measure
Cube cells
    ↓ explore
Slice · Dice · Roll-up · Drill-down · Pivot · Drill-through
    ↓ verify
SQL + source rows + quality checks
    ↓ communicate
Decision Brief
~~~

#### Part B — Final conclusions

The chapter states five durable conclusions:

1. An OLAP cube is a way to organize analytical questions around measures and dimensions. It is not limited to a literal three-dimensional box.
2. A cube cannot repair unclear data meaning. Correct grain, joins, filters, and measure rules must come first.
3. Slice, dice, roll-up, drill-down, pivot, and drill-through are navigation verbs. Each changes focus, detail, presentation, or evidence access in a specific way.
4. SQL exposes the calculation behind the visual. A trustworthy result can be reproduced and traced back to facts.
5. A useful OLAP system balances correctness, clarity, speed, freshness, and governance.

The learner also completes three “explain it simply” prompts:

- Explain OLTP versus OLAP to a store manager.
- Explain fact versus dimension using one Northstar order.
- Explain why a missing cube cell is not automatically zero.

#### Part C — Operation recap board

The learner matches each business request to an operation:

- “Show only February.” → Slice
- “Show Jan/Feb, South/West, Apparel.” → Dice
- “Combine months into Q1.” → Roll-up
- “Open Q1 to see its months.” → Drill-down
- “Put regions in columns instead of rows.” → Pivot
- “Show the order lines behind ₹6,600.” → Drill-through
- “Return details, subtotals, and grand total.” → GROUP BY CUBE or grouping sets

Every match replays a small visual from its original chapter, so the recap reinforces meaning rather than testing vocabulary alone.

#### Part D — Further-learning paths

The learner chooses one or more next missions. Choosing a path creates a saved checklist, but it never locks the other paths.

Path 1 — SQL Analyst:

- Practice joins, common table expressions, window functions, conditional aggregation, ROLLUP, CUBE, and GROUPING SETS.
- Learn to read query plans and compare a detail query with an aggregate query.
- Rebuild the Northstar answers in a relational or columnar SQL engine.

Path 2 — Dimensional Modeler:

- Study conformed dimensions, slowly changing dimensions, degenerate dimensions, factless fact tables, bridge tables, and accumulating snapshots.
- Model returns, refunds, inventory, and targets without mixing grains.
- Write a short definition and aggregation rule for every measure.

Path 3 — BI and Semantic-Layer Builder:

- Learn governed metrics, reusable dimensions, filter context, row-level security, and dashboard design.
- Explore the multidimensional ideas behind MDX or the filter-context ideas behind DAX.
- Build one executive view and one analyst drill-through view from the same definitions.

Path 4 — Data Engineer:

- Learn ETL and ELT, orchestration, incremental loads, change-data capture, partitioning, and data-quality checks.
- Add late-arriving facts and corrected dimension values to the Northstar pipeline.
- Make failed checks quarantine bad data instead of publishing it.

Path 5 — OLAP Performance and Architecture:

- Explore columnar storage, compression, partition pruning, indexes, materialized views, caching, and distributed aggregation.
- Compare ROLAP, MOLAP, HOLAP, and modern lakehouse or real-time OLAP patterns.
- Measure query speed before and after creating a useful aggregate.

#### Part E — Independent practice projects

The site offers three increasingly open challenges:

1. Starter: add a Channel dimension with Web and Store members, then update one cube query.
2. Builder: design an inventory snapshot fact and explain why stock balance is semi-additive across time.
3. Investigator: invent a plausible wrong dashboard total, trace its cause, repair the model or query, and document the evidence.

Interaction: a “Knowledge Map” shows all 17 chapters as connected nodes. The learner first rebuilds the eight-card chain, then completes the operation recap, and finally selects a next path. Every action has button and keyboard alternatives.

Closing quiz:

1. What must be clear before building aggregates? Answer: the fact grain and measure meaning. Explanation: aggregation cannot fix an ambiguous row.
2. Which two structures describe how a fact can be grouped? Answer: dimensions and their hierarchies. Explanation: dimensions provide analysis angles; hierarchies provide levels.
3. Which operation changes the table orientation without changing the facts? Answer: pivot.
4. What is the best way to prove an aggregate? Answer: reproduce it with SQL and drill through to its fact rows.
5. True or false: completing this course means every OLAP system will use the same physical storage. Answer: false. Explanation: the core concepts stay useful across different engines and architectures.

Completion moment:

- Award the “Decision Architect” badge.
- Mark 17 of 17 chapters complete.
- Show the trusted Northstar checksum one final time: 10 facts, 14 units, and ₹19,800 net sales.
- Generate a printable completion card with the learner's chosen next mission.
- Keep Review course, Export progress, Reset progress, and Start next mission controls available.

Final debrief: trustworthy analysis begins with clear meaning, becomes useful through multidimensional exploration, and stays trustworthy through reproducible evidence.

## Glossary drawer

Every highlighted term opens the same plain-language glossary entry:

- Aggregate — combine many values into a summary.
- Cell — one measure value at a chosen set of dimension members.
- Cube — a multidimensional view of measures organized by dimensions.
- Dimension — a way to describe or group facts.
- Drill-down — move from summary to a lower hierarchy level.
- Drill-through — open the detailed rows behind an aggregate.
- Fact — a measurable business event.
- Grain — the exact meaning of one fact row.
- Hierarchy — ordered levels from broad to detailed.
- Measure — a number analyzed or aggregated.
- Member — one value inside a dimension.
- Pivot — rotate rows and columns without changing data.
- Roll-up — move to a broader summary level.
- Slice — fix one dimension to one member.
- Dice — select a smaller range or set across dimensions.
- Star schema — a central fact table connected to descriptive dimensions.

## Page structure

The site is a single static application with these regions:

1. Mission rail: chapter map, completion, and recommended next chapter.
2. Briefing header: story context, chapter goal, XP, and glossary button.
3. Learning stage: lesson text beside the interactive visual.
4. Evidence drawer: raw rows or SQL that support the current result.
5. Quiz panel: answer, submit, explanation, retry, and continue.
6. Decision Brief: persistent claims and checks collected across chapters.

On small screens, the mission rail becomes a drawer and all two-column layouts stack. Tables can scroll horizontally without moving the whole page.

## Visual direction

The intended mood is an Excalidraw-inspired analyst whiteboard:

- near-white canvas with floating pale utility panels
- handwritten chapter titles, diagram labels, annotation arrows, and short Mira notes
- readable sans-serif for lessons, controls, quizzes, and tables
- readable monospace for SQL, keys, and numeric evidence
- rationed indigo for primary actions and active coordinates
- green sketch strokes for reconciled evidence
- orange sketch strokes for questions and attention
- red sketch strokes only for real errors
- rough boxes, imperfect ovals, curved arrows, and connected evidence lines
- restrained motion that demonstrates aggregation and hierarchy changes
- handwriting never carries essential information alone

This direction must be translated into a Superdesign draft before site implementation.

## Accessibility requirements

- Semantic headings, landmarks, tables, buttons, fieldsets, and live regions.
- Fully usable by keyboard, with visible focus.
- 44 × 44 px minimum interactive targets where practical.
- Text and controls meet WCAG AA contrast.
- Color is never the only signal.
- All cube cells and charts have table equivalents.
- Reduced-motion preference disables nonessential transitions.
- Content works at 200% zoom.
- Quiz feedback is announced and never time-limited.
- Correct answers remain discoverable through explanations after an attempt.

## Static-host requirements

- No backend and no runtime secret.
- All data and course content ship with the bundle.
- Progress is local to the browser and can be exported as JSON.
- Direct navigation to a chapter works on static hosting.
- The production build contains no broken local file references.
- The site can run from the generated development command and from its static build output.

## Completion acceptance checklist

- All 17 chapters are implemented and navigable.
- Every chapter contains a briefing, interactive learning action, quiz, explanation, and debrief.
- The shared dataset and every displayed number reconcile to the SQL checksums.
- All named OLAP components and core operations are taught.
- Raw tables, star schema, cube coordinates, SQL, and drill-through are visually connected.
- Progress persists and can be reset and exported.
- Mobile, keyboard, reduced-motion, and missing-versus-zero behavior are verified.
- A production build succeeds.
- The final static site is published through Sites after implementation and validation.
