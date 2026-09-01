# The Decision Room — OLAP Cube Academy

An interactive 17-chapter course that teaches OLAP cubes from raw retail tables to a traceable business decision. The interface uses a whiteboard style, handwriting-inspired headings, readable SQL, chapter quizzes, saved progress, a searchable glossary, and a persistent Decision Brief.

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```bash
cd site
npm install
npm run dev
```

Open <http://localhost:3000/>.

## Verify the course

From the project root:

```bash
node work/validate-course.mjs
sqlite3 :memory: < work/olap-retail-lab.sql
cd site
npm run lint
npx tsc --noEmit
npm run build
```

The SQLite lab is authoritative for the Northstar Retail fixture. Its expected completed-sales checksums are 10 fact rows, 14 units, ₹21,150 gross, ₹1,350 discounts, and ₹19,800 net sales. Cancelled order 1006 remains in the raw evidence and is excluded from `fact_sales`.

## Project map

- `site/` — the runnable interactive course
- `work/course-manifest.json` — the 17-chapter curriculum, activities, and 54 quiz questions
- `work/olap-retail-lab.sql` — runnable SQLite lab from raw tables through cube-style queries
- `work/olap-cube-fixture.json` — expected cells, roll-ups, pivots, and drill-through evidence
- `work/validate-course.mjs` — deterministic curriculum and data checks

The generated social preview is `site/public/og.png`.
