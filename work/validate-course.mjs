import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const base = new URL("./", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("course-manifest.json", base), "utf8"));
const fixture = JSON.parse(readFileSync(new URL("olap-cube-fixture.json", base), "utf8"));
const specification = readFileSync(new URL("decision-room-course-spec.md", base), "utf8");
const sql = readFileSync(new URL("olap-retail-lab.sql", base), "utf8");
const labs = readFileSync(new URL("../app/course-labs.tsx", base), "utf8");
const courseData = readFileSync(new URL("../app/course-data.ts", base), "utf8");

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const expectedNumbers = Array.from({ length: 17 }, (_, index) => index + 1);
const chapterNumbers = manifest.chapters.map((chapter) => chapter.number);
const headings = Array.from(
  specification.matchAll(/^### Chapter ([0-9]+) —/gm),
  (match) => Number(match[1])
);

check(manifest.chapterCount === 17, "Manifest must declare 17 chapters.");
check(manifest.numbering.startsAt === 1, "Chapter numbering must start at 1.");
check(manifest.numbering.endsAt === 17, "Chapter numbering must end at 17.");
check(manifest.chapters.length === 17, "Manifest must contain 17 chapter records.");
check(
  JSON.stringify(chapterNumbers) === JSON.stringify(expectedNumbers),
  "Manifest chapter numbers must be sequential from 1 through 17."
);
check(
  JSON.stringify(headings) === JSON.stringify(expectedNumbers),
  "Specification headings must be sequential from Chapter 1 through Chapter 17."
);
check(!specification.includes("All 16 chapters"), "Specification contains stale 16-chapter wording.");

const chapterSlugs = manifest.chapters.map((chapter) => chapter.slug);
check(new Set(chapterSlugs).size === 17, "Every chapter slug must be unique.");
check(
  manifest.chapters.every((chapter) =>
    chapter.title &&
    chapter.objective &&
    chapter.story &&
    chapter.debrief &&
    chapter.interaction?.instruction &&
    chapter.interaction?.completion
  ),
  "Every chapter must contain its complete learning and interaction contract."
);

const quizzes = manifest.chapters.flatMap((chapter) => chapter.quiz);
const quizIds = quizzes.map((quiz) => quiz.id);
check(quizzes.length === 54, "The course must contain the expected 54 quiz questions.");
check(new Set(quizIds).size === quizzes.length, "Every quiz ID must be unique.");
check(
  quizzes.every((quiz) =>
    quiz.question &&
    Array.isArray(quiz.options) &&
    quiz.options.length >= 2 &&
    Number.isInteger(quiz.correctIndex) &&
    quiz.correctIndex >= 0 &&
    quiz.correctIndex < quiz.options.length &&
    quiz.explanation
  ),
  "Every quiz must have options, a valid answer index, and an explanation."
);

check(fixture.totals.completedFacts === 10, "Fixture must contain 10 completed facts.");
check(fixture.totals.completedUnits === 14, "Fixture must contain 14 completed units.");
check(fixture.totals.grossSales === 21150, "Fixture gross sales must equal 21150.");
check(fixture.totals.discounts === 1350, "Fixture discounts must equal 1350.");
check(fixture.totals.netSales === 19800, "Fixture net sales must equal 19800.");
check(
  manifest.dataset.completedFacts === fixture.totals.completedFacts &&
  manifest.dataset.completedUnits === fixture.totals.completedUnits &&
  manifest.dataset.grossSales === fixture.totals.grossSales &&
  manifest.dataset.discounts === fixture.totals.discounts &&
  manifest.dataset.netSales === fixture.totals.netSales,
  "Manifest and cube fixture checksums must agree."
);
check(
  manifest.dataset.loadedAt === fixture.loadMetadata.loadedAt &&
  manifest.dataset.dataThrough === fixture.loadMetadata.dataThrough,
  "Manifest and cube fixture load metadata must agree."
);

const coordinateKeys = fixture.cells.map(
  (cell) => [cell.month, cell.region, cell.category].join("|")
);
const observedCells = fixture.cells.filter((cell) => cell.state === "observed");
const missingCells = fixture.cells.filter((cell) => cell.state === "missing");
check(fixture.cells.length === 24, "The Jan-Apr × 3 regions × 2 categories grid must have 24 cells.");
check(new Set(coordinateKeys).size === 24, "Every cube coordinate must be unique.");
check(observedCells.length === 8, "The cube must have exactly 8 observed cells.");
check(missingCells.length === 16, "The cube must have exactly 16 missing cells.");
check(
  missingCells.every((cell) => cell.netSales === null),
  "Every missing cell must use null, never zero."
);
check(
  observedCells.reduce((sum, cell) => sum + cell.netSales, 0) === 19800,
  "Observed cube cells must reconcile to total net sales."
);
check(
  fixture.displayRules.missingCell === "—" &&
  fixture.displayRules.measuredZero === "₹0",
  "Missing and measured-zero display labels must remain distinct."
);

const drillThrough = fixture.operations.drillThroughFebruaryNorthHome;
check(
  drillThrough.facts.reduce((sum, fact) => sum + fact.net, 0) ===
    drillThrough.aggregateNetSales &&
  drillThrough.aggregateNetSales === 6600,
  "Drill-through facts must reconcile to the February × North × Home cell."
);
check(
  fixture.operations.fullCubeGroupingPatterns.length === 8,
  "Three dimensions must produce eight full-cube grouping patterns."
);

const labCases = Array.from(labs.matchAll(/case ([0-9]+): return/g), (match) => Number(match[1]));
check(
  JSON.stringify(labCases) === JSON.stringify(expectedNumbers),
  "The interactive application must route every chapter from 1 through 17 to a lab."
);
for (const requiredSignal of [
  "tracedOrders.includes(1002)",
  "duplicationChecked && duplicationPass",
  "connected === keyLinks.length",
  "populatedCoordinates.length >= 3",
  "'GROUP BY', 'HAVING', 'ORDER BY'",
  "Month>Quarter>Month",
  "hasPivoted && drilled && totalVerified",
  "solved === 8",
  "operatorsVisited.length === 3",
  "Run 8 data checks",
  "sequenceCorrect && operationsCorrect && checklistComplete"
]) {
  check(labs.includes(requiredSignal), "Interactive completion contract missing: " + requiredSignal);
}
for (const forbiddenSqlSignal of ["FROM sales_star", "INSERT INTO fact_sales (...)", "MAX(loaded_at)"]) {
  check(!courseData.includes(forbiddenSqlSignal), "Non-runnable chapter SQL remains: " + forbiddenSqlSignal);
}

let sqlOutput = "";
try {
  sqlOutput = execFileSync("sqlite3", [":memory:"], {
    input: sql,
    encoding: "utf8"
  });
} catch (error) {
  failures.push("SQLite execution failed: " + error.message);
}

for (const name of [
  "raw counts",
  "completed fact checksum",
  "cancelled order excluded",
  "fact integrity",
  "load metadata"
]) {
  check(sqlOutput.includes(name + "|PASS"), "SQL check did not pass: " + name);
}

if (failures.length > 0) {
  console.error("Course validation: FAIL");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log("Course validation: PASS");
console.log("- Chapters: 17, numbered 1 through 17");
console.log("- Interactions: 17");
console.log("- Quiz questions: " + quizzes.length);
console.log("- Cube cells: 8 observed, 16 missing");
console.log("- SQL integrity checks: 5 passed");
console.log("- Interactive chapter routes: 17 passed");
console.log("- Trusted net sales: ₹" + fixture.totals.netSales.toLocaleString("en-IN"));
