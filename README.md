# The Decision Room — OLAP Cube Academy

An interactive 17-chapter course that teaches OLAP cubes from raw retail tables to a traceable business decision. The interface uses a whiteboard style, handwriting-inspired headings, readable SQL, chapter quizzes, saved progress, a searchable glossary, and a persistent Decision Brief.

**Live site:** [sidharthism.github.io/olap-cube-academy](https://sidharthism.github.io/olap-cube-academy/)

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000/>.

## Verify the course

From the project root:

```bash
node work/validate-course.mjs
sqlite3 :memory: < work/olap-retail-lab.sql
npm run lint
npx tsc --noEmit
npm run test
npm run build
```

The SQLite lab is authoritative for the Northstar Retail fixture. Its expected completed-sales checksums are 10 fact rows, 14 units, ₹21,150 gross, ₹1,350 discounts, and ₹19,800 net sales. Cancelled order 1006 remains in the raw evidence and is excluded from `fact_sales`.

## Deploy

GitHub Pages deploys automatically on pushes to `main` via `.github/workflows/pages.yml`. The workflow runs `npm run build:static` with `NEXT_PUBLIC_BASE_PATH` set to the repository name and publishes the `out/` directory.

For a local static export:

```bash
NEXT_PUBLIC_BASE_PATH=/olap-cube-academy npm run build:static
```

## Project map

- `app/` — the runnable interactive course (Next.js App Router)
- `public/` — favicons, DuckDB WASM assets, and social preview (`og.png`)
- `work/course-manifest.json` — the 17-chapter curriculum, activities, and 54 quiz questions
- `work/decision-room-course-spec.md` — full product and learning specification
- `work/olap-retail-lab.sql` — runnable SQLite lab from raw tables through cube-style queries
- `work/olap-cube-fixture.json` — expected cells, roll-ups, pivots, and drill-through evidence
- `work/validate-course.mjs` — deterministic curriculum and data checks
- `DESIGN.md` — portable visual design guide for the whiteboard UI

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, DuckDB WASM for in-browser SQL, and vinext for local development.
