import manifest from '../work/course-manifest.json';

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type CourseChapter = {
  number: number;
  slug: string;
  title: string;
  phase: string;
  objective: string;
  story: string;
  concepts: string[];
  interaction: {
    type: string;
    instruction: string;
    completion: string;
  };
  debrief: string;
  quiz: QuizQuestion[];
};

export const course = manifest as typeof manifest & { chapters: CourseChapter[] };

export type RawOrder = {
  orderId: number;
  orderDate: string;
  customerId: string;
  storeId: string;
  status: 'completed' | 'cancelled';
};

export type RawLine = {
  orderId: number;
  lineNo: number;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
};

export const rawCustomers = [
  { customerId: 'C001', customerName: 'Asha Rao', city: 'Bengaluru' },
  { customerId: 'C002', customerName: 'Kabir Shah', city: 'Mumbai' },
  { customerId: 'C003', customerName: 'Meera Sen', city: 'Chennai' },
];

export const rawProducts = [
  { productId: 'P01', productName: 'T-Shirt', category: 'Apparel' },
  { productId: 'P02', productName: 'Jeans', category: 'Apparel' },
  { productId: 'P03', productName: 'Kettle', category: 'Home' },
  { productId: 'P04', productName: 'Lamp', category: 'Home' },
];

export const rawStores = [
  { storeId: 'S01', storeName: 'Marina Store', region: 'South' },
  { storeId: 'S02', storeName: 'Capital Store', region: 'North' },
  { storeId: 'S03', storeName: 'Harbor Store', region: 'West' },
];

export const rawOrders: RawOrder[] = [
  { orderId: 1001, orderDate: '2026-01-05', customerId: 'C001', storeId: 'S01', status: 'completed' },
  { orderId: 1002, orderDate: '2026-01-12', customerId: 'C002', storeId: 'S03', status: 'completed' },
  { orderId: 1003, orderDate: '2026-02-03', customerId: 'C003', storeId: 'S01', status: 'completed' },
  { orderId: 1004, orderDate: '2026-02-14', customerId: 'C001', storeId: 'S02', status: 'completed' },
  { orderId: 1005, orderDate: '2026-04-08', customerId: 'C002', storeId: 'S03', status: 'completed' },
  { orderId: 1006, orderDate: '2026-02-20', customerId: 'C003', storeId: 'S03', status: 'cancelled' },
];

export const rawLines: RawLine[] = [
  { orderId: 1001, lineNo: 1, productId: 'P01', quantity: 1, unitPrice: 1000, discount: 100 },
  { orderId: 1001, lineNo: 2, productId: 'P03', quantity: 1, unitPrice: 1300, discount: 100 },
  { orderId: 1002, lineNo: 1, productId: 'P02', quantity: 2, unitPrice: 900, discount: 200 },
  { orderId: 1002, lineNo: 2, productId: 'P04', quantity: 1, unitPrice: 3000, discount: 300 },
  { orderId: 1003, lineNo: 1, productId: 'P01', quantity: 2, unitPrice: 800, discount: 100 },
  { orderId: 1003, lineNo: 2, productId: 'P02', quantity: 2, unitPrice: 950, discount: 100 },
  { orderId: 1004, lineNo: 1, productId: 'P03', quantity: 2, unitPrice: 1800, discount: 0 },
  { orderId: 1004, lineNo: 2, productId: 'P04', quantity: 1, unitPrice: 3250, discount: 250 },
  { orderId: 1005, lineNo: 1, productId: 'P01', quantity: 1, unitPrice: 600, discount: 100 },
  { orderId: 1005, lineNo: 2, productId: 'P03', quantity: 1, unitPrice: 3100, discount: 100 },
  { orderId: 1006, lineNo: 1, productId: 'P03', quantity: 2, unitPrice: 3000, discount: 0 },
];

export type FactRow = {
  order: number;
  line: number;
  date: string;
  month: 'January' | 'February' | 'April';
  quarter: 'Q1' | 'Q2';
  region: 'North' | 'South' | 'West';
  store: string;
  category: 'Apparel' | 'Home';
  product: string;
  quantity: number;
  gross: number;
  discount: number;
  net: number;
};

export const factRows: FactRow[] = [
  { order: 1001, line: 1, date: '2026-01-05', month: 'January', quarter: 'Q1', region: 'South', store: 'Marina Store', category: 'Apparel', product: 'T-Shirt', quantity: 1, gross: 1000, discount: 100, net: 900 },
  { order: 1001, line: 2, date: '2026-01-05', month: 'January', quarter: 'Q1', region: 'South', store: 'Marina Store', category: 'Home', product: 'Kettle', quantity: 1, gross: 1300, discount: 100, net: 1200 },
  { order: 1002, line: 1, date: '2026-01-12', month: 'January', quarter: 'Q1', region: 'West', store: 'Harbor Store', category: 'Apparel', product: 'Jeans', quantity: 2, gross: 1800, discount: 200, net: 1600 },
  { order: 1002, line: 2, date: '2026-01-12', month: 'January', quarter: 'Q1', region: 'West', store: 'Harbor Store', category: 'Home', product: 'Lamp', quantity: 1, gross: 3000, discount: 300, net: 2700 },
  { order: 1003, line: 1, date: '2026-02-03', month: 'February', quarter: 'Q1', region: 'South', store: 'Marina Store', category: 'Apparel', product: 'T-Shirt', quantity: 2, gross: 1600, discount: 100, net: 1500 },
  { order: 1003, line: 2, date: '2026-02-03', month: 'February', quarter: 'Q1', region: 'South', store: 'Marina Store', category: 'Apparel', product: 'Jeans', quantity: 2, gross: 1900, discount: 100, net: 1800 },
  { order: 1004, line: 1, date: '2026-02-14', month: 'February', quarter: 'Q1', region: 'North', store: 'Capital Store', category: 'Home', product: 'Kettle', quantity: 2, gross: 3600, discount: 0, net: 3600 },
  { order: 1004, line: 2, date: '2026-02-14', month: 'February', quarter: 'Q1', region: 'North', store: 'Capital Store', category: 'Home', product: 'Lamp', quantity: 1, gross: 3250, discount: 250, net: 3000 },
  { order: 1005, line: 1, date: '2026-04-08', month: 'April', quarter: 'Q2', region: 'West', store: 'Harbor Store', category: 'Apparel', product: 'T-Shirt', quantity: 1, gross: 600, discount: 100, net: 500 },
  { order: 1005, line: 2, date: '2026-04-08', month: 'April', quarter: 'Q2', region: 'West', store: 'Harbor Store', category: 'Home', product: 'Kettle', quantity: 1, gross: 3100, discount: 100, net: 3000 },
];

export const loadMetadata = {
  datasetId: 'northstar-retail-v1',
  loadedAt: '2026-04-30T06:00:00Z',
  dataThrough: '2026-04-30',
} as const;

export function money(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export const chapterDetails: Record<number, {
  plain: string;
  mentalModel: string;
  sqlTitle: string;
  sql: string;
  takeaway: string;
}> = {
  1: {
    plain: 'OLAP exists because business leaders ask questions that scan, group, compare, and summarize many events. A checkout database is designed to record one order safely; an analytical system is designed to explore patterns across many orders.',
    mentalModel: 'OLTP is the receipt desk. OLAP is the decision table where many receipts become evidence.',
    sqlTitle: 'One row versus many rows',
    sql: `-- OLTP: find one event\nSELECT * FROM raw_orders WHERE order_id = 1004;\n\n-- OLAP: compare many completed events\nSELECT d.month_name, s.region, SUM(f.net_amount) AS net_sales\nFROM fact_sales AS f\nJOIN dim_date AS d ON d.date_key = f.date_key\nJOIN dim_store AS s ON s.store_key = f.store_key\nGROUP BY d.month_number, d.month_name, s.region\nORDER BY d.month_number, s.region;`,
    takeaway: 'The term OLAP was introduced in a 1993 report by E. F. Codd, S. B. Codd, and C. T. Salley. The deeper idea is older: help people explore summarized business data interactively.',
  },
  2: {
    plain: 'Raw transaction tables are normalized: each fact is stored once, and IDs connect related rows. An order header says who, when, and where. Order lines say which products and how much.',
    mentalModel: 'Follow the keys like a paper trail: customer → order → order line → product.',
    sqlTitle: 'Trace order 1004 through raw tables',
    sql: `SELECT o.order_id, l.line_no, p.product_name,\n       l.quantity, l.unit_price, l.discount_amount,\n       l.quantity * l.unit_price - l.discount_amount AS net_sales\nFROM raw_orders o\nJOIN raw_order_lines l ON l.order_id = o.order_id\nJOIN raw_products p ON p.product_id = l.product_id\nWHERE o.order_id = 1004\nORDER BY l.line_no;`,
    takeaway: 'Keep physical raw-table columns honest: IDs live in raw tables; names appear only after a join.',
  },
  3: {
    plain: 'Grain is the exact meaning of one fact row. Define it before writing joins or choosing measures. Here, one fact means one completed order line.',
    mentalModel: 'A ruler is useful only after you know what one mark means. Grain defines the mark.',
    sqlTitle: 'Count lines and orders correctly',
    sql: `SELECT COUNT(*) AS completed_order_lines,\n       COUNT(DISTINCT o.order_id) AS completed_orders\nFROM raw_orders o\nJOIN raw_order_lines l ON l.order_id = o.order_id\nWHERE o.status = 'completed';\n-- 10 lines, 5 orders`,
    takeaway: 'At line grain, COUNT(*) counts lines. Use COUNT(DISTINCT order_id) to count orders.',
  },
  4: {
    plain: 'A star schema puts measurable events in the middle and descriptive context around them. It makes repeated analytical joins easy to understand and hard to misuse.',
    mentalModel: 'The fact table is the event. Dimensions answer when, what, where, and who.',
    sqlTitle: 'Create the fact table and load only completed lines',
    sql: `CREATE TABLE fact_sales (\n  order_id INTEGER NOT NULL, line_no INTEGER NOT NULL,\n  date_key INTEGER NOT NULL REFERENCES dim_date(date_key),\n  product_key INTEGER NOT NULL REFERENCES dim_product(product_key),\n  store_key INTEGER NOT NULL REFERENCES dim_store(store_key),\n  customer_key INTEGER NOT NULL REFERENCES dim_customer(customer_key),\n  quantity INTEGER NOT NULL CHECK (quantity > 0),\n  gross_amount INTEGER NOT NULL, discount_amount INTEGER NOT NULL,\n  net_amount INTEGER NOT NULL, PRIMARY KEY (order_id, line_no),\n  CHECK (gross_amount - discount_amount = net_amount)\n);\n\nINSERT INTO fact_sales\nSELECT o.order_id, l.line_no,\n       CAST(replace(o.order_date, '-', '') AS INTEGER),\n       p.product_key, s.store_key, c.customer_key,\n       l.quantity, l.quantity * l.unit_price, l.discount_amount,\n       l.quantity * l.unit_price - l.discount_amount\nFROM raw_orders AS o\nJOIN raw_order_lines AS l ON l.order_id = o.order_id\nJOIN dim_product AS p ON p.product_id = l.product_id\nJOIN dim_store AS s ON s.store_id = o.store_id\nJOIN dim_customer AS c ON c.customer_id = o.customer_id\nWHERE o.status = 'completed';`,
    takeaway: 'Dimensions describe; facts measure. The load applies the cancelled-order rule once and consistently.',
  },
  5: {
    plain: 'A dimension is a business viewpoint. A member is one value inside it. A hierarchy defines a meaningful path from detail to summary.',
    mentalModel: 'Day → Month → Quarter → Year is a ladder. Going up combines; going down reveals detail.',
    sqlTitle: 'Group at several time levels',
    sql: `SELECT d.year_number, d.quarter_name, d.month_name,\n       SUM(f.net_amount) AS net_sales\nFROM fact_sales f\nJOIN dim_date d ON d.date_key = f.date_key\nGROUP BY d.year_number, d.quarter_name, d.month_name\nORDER BY d.year_number, MIN(d.month_number);`,
    takeaway: 'North is a member of the Region level. Region is part of the Store dimension.',
  },
  6: {
    plain: 'A measure is a number we analyze. Additive measures can be summed across every relevant dimension. Ratios and averages usually need to be recalculated from their parts.',
    mentalModel: 'Add ingredients, not finished ratios. Sum sales and units, then calculate sales per unit.',
    sqlTitle: 'Calculate safe totals and a ratio',
    sql: `SELECT SUM(quantity) AS units,\n       SUM(gross_amount) AS gross_sales,\n       SUM(discount_amount) AS discounts,\n       SUM(net_amount) AS net_sales,\n       1.0 * SUM(net_amount) / SUM(quantity) AS sales_per_unit\nFROM fact_sales;`,
    takeaway: 'Unit price is numeric but non-additive. Inventory balance is often semi-additive across time.',
  },
  7: {
    plain: 'A cube cell is one measure at one coordinate. The axes come from dimensions; the number comes from aggregating matching fact rows.',
    mentalModel: '[February, North, Home] is an address. ₹6,600 is the value stored or calculated at that address.',
    sqlTitle: 'Create a logical cube with GROUP BY',
    sql: `WITH months AS (\n  SELECT DISTINCT month_number, month_name\n  FROM dim_date WHERE year_number = 2026\n),\nregions(region) AS (VALUES ('North'), ('South'), ('West')),\ncategories(category) AS (VALUES ('Apparel'), ('Home')),\ncells AS (\n  SELECT d.month_number, s.region, p.category,\n         SUM(f.net_amount) AS net_sales\n  FROM fact_sales AS f\n  JOIN dim_date AS d ON d.date_key = f.date_key\n  JOIN dim_store AS s ON s.store_key = f.store_key\n  JOIN dim_product AS p ON p.product_key = f.product_key\n  WHERE d.year_number = 2026\n  GROUP BY d.month_number, s.region, p.category\n)\nSELECT m.month_name, r.region, c.category, cells.net_sales\nFROM months AS m\nCROSS JOIN regions AS r\nCROSS JOIN categories AS c\nLEFT JOIN cells ON cells.month_number = m.month_number\n               AND cells.region = r.region\n               AND cells.category = c.category\nORDER BY m.month_number, r.region, c.category;`,
    takeaway: 'The cube is a logical model. It can be calculated from relational tables; it does not need to be a literal stored 3D object.',
  },
  8: {
    plain: 'SQL expresses the cube in parts: SELECT chooses labels and measures, JOIN supplies context, WHERE filters, GROUP BY defines coordinates, and SUM calculates cells.',
    mentalModel: 'SQL is a recipe. Each clause controls one visible part of the analytical view.',
    sqlTitle: 'Read the complete grouped query',
    sql: `SELECT d.year_number, d.month_name, s.region, p.category,\n       SUM(f.net_amount) AS net_sales\nFROM fact_sales f\nJOIN dim_date d ON d.date_key = f.date_key\nJOIN dim_store s ON s.store_key = f.store_key\nJOIN dim_product p ON p.product_key = f.product_key\nWHERE d.year_number = 2026\nGROUP BY d.year_number, d.month_number, d.month_name,\n         s.region, p.category\nHAVING SUM(f.net_amount) > 0\nORDER BY d.month_number, s.region, p.category;`,
    takeaway: 'Every selected descriptive column must be grouped or derived from grouped columns.',
  },
  9: {
    plain: 'Slice fixes one member, such as February. Dice keeps a smaller set across several dimensions, such as two months, two regions, and one category.',
    mentalModel: 'Slice is one clean cut. Dice is a smaller box cut from several axes.',
    sqlTitle: 'Translate filters into WHERE',
    sql: `SELECT d.month_name, s.region, p.category,\n       SUM(f.net_amount) AS net_sales\nFROM fact_sales AS f\nJOIN dim_date AS d ON d.date_key = f.date_key\nJOIN dim_store AS s ON s.store_key = f.store_key\nJOIN dim_product AS p ON p.product_key = f.product_key\nWHERE d.year_number = 2026\n  AND d.month_number IN (1, 2)\n  AND s.region IN ('South', 'West')\n  AND p.category = 'Apparel'\nGROUP BY d.month_number, d.month_name, s.region, p.category\nORDER BY d.month_number, s.region;\n-- Dice total across returned rows = ₹5,800`,
    takeaway: 'Filters change which facts participate. A pivot only changes where the same results are displayed.',
  },
  10: {
    plain: 'Roll-up moves toward summary; drill-down moves toward detail. Q1 contains January, February, and a March member with no facts in this dataset.',
    mentalModel: 'Groups merge on the way up and split on the way down. The conserved total proves the path is consistent.',
    sqlTitle: 'Roll months into quarters',
    sql: `SELECT d.year_number, d.quarter_name,\n       SUM(f.net_amount) AS net_sales\nFROM fact_sales f\nJOIN dim_date d ON d.date_key = f.date_key\nGROUP BY d.year_number, d.quarter_name;\n-- Q1 = ₹16,300\n-- Q2 through April = ₹3,500`,
    takeaway: 'Drill-down changes hierarchy level. Drill-through opens the underlying fact rows.',
  },
  11: {
    plain: 'Pivot swaps presentation axes without changing facts. Drill-through opens the detailed rows that produced a selected aggregate.',
    mentalModel: 'Rotate the report, then open one number’s evidence envelope.',
    sqlTitle: 'Drill through the ₹6,600 cell',
    sql: `SELECT f.order_id, f.line_no, p.product_name, f.net_amount\nFROM fact_sales f\nJOIN dim_date d ON d.date_key = f.date_key\nJOIN dim_store s ON s.store_key = f.store_key\nJOIN dim_product p ON p.product_key = f.product_key\nWHERE d.year_number = 2026 AND d.month_number = 2\n  AND s.region = 'North' AND p.category = 'Home';`,
    takeaway: 'Kettle ₹3,600 + Lamp ₹3,000 = ₹6,600. Traceability turns a number into evidence.',
  },
  12: {
    plain: 'CUBE produces every subtotal combination. ROLLUP follows an ordered hierarchy by removing trailing levels. GROUPING SETS returns only the levels you explicitly request.',
    mentalModel: 'For three dimensions, CUBE has 2³ = 8 patterns. ROLLUP (Month, Region, Category) has four ordered prefixes: all three, the first two, Month only, and the grand total.',
    sqlTitle: 'Generate all subtotal levels safely',
    sql: `SELECT d.month_name, s.region, p.category,\n       SUM(f.net_amount) AS net_sales,\n       GROUPING(d.month_name) AS g_month,\n       GROUPING(s.region) AS g_region,\n       GROUPING(p.category) AS g_category\nFROM fact_sales f\nJOIN dim_date d ON d.date_key = f.date_key\nJOIN dim_store s ON s.store_key = f.store_key\nJOIN dim_product p ON p.product_key = f.product_key\nWHERE d.year_number = 2026\nGROUP BY CUBE (d.month_name, s.region, p.category);\n\n-- Ordered prefix sequence:\n-- GROUP BY ROLLUP (d.month_name, s.region, p.category)\n-- => (month, region, category), (month, region), (month), ()\n\n-- Chosen levels only:\n-- GROUP BY GROUPING SETS ((d.month_name, s.region, p.category),\n--                         (d.month_name), (s.region), ())`,
    takeaway: 'GROUPING flags distinguish a rolled-up placeholder NULL from an actual NULL dimension member. An absent coordinate is different again and needs a scaffold plus an outer join. SQLite emulates these subtotal levels with UNION ALL.',
  },
  13: {
    plain: 'Analytical results can look plausible while being wrong. Common causes are fanout joins, cancelled events, averages of averages, wrong distinct counts, and silent zero-filling.',
    mentalModel: 'Trust is not a feeling. Reconcile row counts, totals, keys, and business rules.',
    sqlTitle: 'Run invariant checks',
    sql: `SELECT COUNT(*) AS facts, COUNT(DISTINCT order_id) AS orders,\n       SUM(quantity) AS units, SUM(gross_amount) AS gross,\n       SUM(discount_amount) AS discounts, SUM(net_amount) AS net\nFROM fact_sales;\n-- 10, 5, 14, 21150, 1350, 19800`,
    takeaway: 'A missing cell says no matching fact. Display zero only when a stated semantic rule intentionally zero-fills it.',
  },
  14: {
    plain: 'ROLAP queries relational or columnar tables. MOLAP uses multidimensional structures. HOLAP mixes detailed relational data with multidimensional or pre-aggregated summaries.',
    mentalModel: 'Choose an engine by trade-off: freshness, speed, scale, storage, flexibility, and drill-through.',
    sqlTitle: 'One model, different execution choices',
    sql: `-- ROLAP: query fact and dimensions directly.\nSELECT s.region, p.category, SUM(f.net_amount) AS net_sales\nFROM fact_sales AS f\nJOIN dim_store AS s ON s.store_key = f.store_key\nJOIN dim_product AS p ON p.product_key = f.product_key\nGROUP BY s.region, p.category;\n\n-- SQLite pre-aggregation used by a HOLAP-style design.\nDROP TABLE IF EXISTS monthly_region_category;\nCREATE TABLE monthly_region_category AS\nSELECT d.year_number, d.month_number, d.month_name,\n       s.region, p.category, SUM(f.net_amount) AS net_sales\nFROM fact_sales AS f\nJOIN dim_date AS d ON d.date_key = f.date_key\nJOIN dim_store AS s ON s.store_key = f.store_key\nJOIN dim_product AS p ON p.product_key = f.product_key\nGROUP BY d.year_number, d.month_number, d.month_name, s.region, p.category;`,
    takeaway: 'MOLAP is not “aggregates only.” It stores data in multidimensional structures and can keep multiple levels of detail.',
  },
  15: {
    plain: 'Performance techniques are useful only if the result stays fresh and correct. Partition pruning, columnar scans, pre-aggregation, caching, and semantic definitions solve different bottlenecks.',
    mentalModel: 'Fast + stale is wrong. Fast + untraceable is risky. Measure speed and trust together.',
    sqlTitle: 'Quality and freshness gates',
    sql: `SELECT m.loaded_at, m.data_through,\n       COUNT(f.order_id) AS fact_rows, SUM(f.net_amount) AS net_sales,\n       CASE WHEN m.loaded_at = '2026-04-30T06:00:00Z'\n              AND m.data_through = '2026-04-30'\n              AND COUNT(f.order_id) = 10\n              AND SUM(f.net_amount) = 19800\n            THEN 'PASS' ELSE 'FAIL' END AS quality_gate\nFROM etl_metadata AS m\nCROSS JOIN fact_sales AS f\nWHERE m.dataset_id = 'northstar-retail-v1'\nGROUP BY m.loaded_at, m.data_through;\n-- 2026-04-30T06:00:00Z · through 2026-04-30 · 10 · 19800 · PASS`,
    takeaway: 'For this lab, the deterministic as-of time is 2026-04-30 06:00 UTC. Production checks compare that time with an agreed service level.',
  },
  16: {
    plain: 'A decision brief connects a claim to a reproducible query and drill-through evidence. The strongest conclusion states the time period and coverage limits.',
    mentalModel: 'Claim → aggregate → contributing facts → business action.',
    sqlTitle: 'Evidence for the leadership conclusion',
    sql: `WITH q1_months AS (\n  SELECT DISTINCT month_number, month_name\n  FROM dim_date\n  WHERE year_number = 2026 AND quarter_name = 'Q1'\n)\nSELECT m.month_name, SUM(f.net_amount) AS net_sales\nFROM q1_months AS m\nLEFT JOIN dim_date AS d ON d.month_number = m.month_number\n                       AND d.year_number = 2026\nLEFT JOIN fact_sales AS f ON f.date_key = d.date_key\nGROUP BY m.month_number, m.month_name\nORDER BY m.month_number;\n-- January 6400; February 9900; March NULL (no facts)`,
    takeaway: 'February exceeds January by ₹3,500. The largest February cell is North × Home at ₹6,600, backed by two fact rows.',
  },
  17: {
    plain: 'You can now travel from raw events to a trusted decision: define grain, build a star, choose measures, create cells, navigate the cube, inspect evidence, and protect the answer.',
    mentalModel: 'Raw rows → facts → dimensions → cube → operation → evidence → decision.',
    sqlTitle: 'The reusable question pattern',
    sql: `SELECT d.quarter_name, s.region, p.category,\n       SUM(f.net_amount) AS net_sales\nFROM fact_sales AS f\nJOIN dim_date AS d ON d.date_key = f.date_key\nJOIN dim_store AS s ON s.store_key = f.store_key\nJOIN dim_product AS p ON p.product_key = f.product_key\nWHERE d.year_number = 2026\nGROUP BY d.quarter_name, s.region, p.category\nORDER BY d.quarter_name, s.region, p.category;`,
    takeaway: 'Further learning: practise window functions, slowly changing dimensions, semantic layers, columnar execution, materialized views, and real engine query plans.',
  },
};

export const glossary = [
  ['Additive measure', 'A measure that can be summed across every relevant dimension, such as net sales.'],
  ['Aggregate', 'A summary made from several detailed values, such as SUM(net_sales).'],
  ['Attribute', 'A descriptive field inside a dimension, such as product name.'],
  ['Cell', 'One measure value located by a combination of dimension members.'],
  ['Coordinate', 'The member values that locate a cell, such as [February, North, Home].'],
  ['Cube', 'A logical multidimensional model for analysing measures by several business viewpoints.'],
  ['Degenerate dimension', 'A business identifier kept in the fact table without its own dimension table, such as order_id.'],
  ['Dice', 'Filter several dimensions to keep a smaller sub-cube.'],
  ['Dimension', 'A business viewpoint used to group or filter facts, such as Time, Product, or Store.'],
  ['Drill-down', 'Move from a summary level to a more detailed hierarchy level.'],
  ['Drill-through', 'Open the detailed fact rows behind an aggregate.'],
  ['Fact', 'A measurable business event at a declared grain.'],
  ['Grain', 'The exact meaning of one fact-table row.'],
  ['Hierarchy', 'A valid path between detail and summary levels.'],
  ['HOLAP', 'A hybrid approach combining relational detail with multidimensional or pre-aggregated structures.'],
  ['Measure', 'A number analysed in a cube, such as quantity or net sales.'],
  ['Member', 'One value inside a dimension level, such as North.'],
  ['Missing cell', 'A coordinate with no matching fact rows; it is not automatically a measured zero.'],
  ['MOLAP', 'OLAP implemented with multidimensional storage structures.'],
  ['OLAP', 'Online analytical processing: interactive analysis of summarized data across dimensions.'],
  ['OLTP', 'Online transaction processing: recording small, frequent business events safely.'],
  ['Pivot', 'Swap presentation axes without changing the underlying facts.'],
  ['ROLAP', 'OLAP implemented by querying relational or columnar fact and dimension tables.'],
  ['Roll-up', 'Move from detail to a more summarized hierarchy level.'],
  ['Semi-additive measure', 'A measure that can be summed across some dimensions but not all, such as inventory balance across stores but not dates.'],
  ['Slice', 'Fix one dimension to one member, such as February.'],
  ['Sparse cube', 'A cube where many possible coordinates have no facts.'],
  ['Star schema', 'A central fact table connected to surrounding dimension tables.'],
] as const;

export const learningResources = [
  {
    title: 'The 1993 OLAP report',
    source: 'Codd, Codd, and Salley',
    description: 'The bibliographic record for the report that introduced the term OLAP.',
    href: 'https://books.google.com/books/about/Providing_OLAP_On_line_Analytical_Proces.html?id=pt0lGwAACAAJ',
  },
  {
    title: 'The original Data Cube paper',
    source: 'Microsoft Research',
    description: 'The research behind CUBE, cross-tabs, subtotals, and generalized GROUP BY.',
    href: 'https://www.microsoft.com/en-us/research/publication/data-cube-a-relational-aggregation-operator-generalizing-group-by-cross-tab-and-sub-totals/',
  },
  {
    title: 'Declare the grain first',
    source: 'Kimball Group',
    description: 'A short guide to defining exactly what one fact-table row means.',
    href: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/',
  },
  {
    title: 'CUBE, ROLLUP, and GROUPING SETS',
    source: 'PostgreSQL documentation',
    description: 'Official SQL syntax and semantics for generating multiple grouping levels.',
    href: 'https://www.postgresql.org/docs/16/queries-table-expressions.html',
  },
  {
    title: 'SQLite aggregate functions',
    source: 'SQLite documentation',
    description: 'Official reference for the aggregate functions used in the runnable lab.',
    href: 'https://www.sqlite.org/lang_aggfunc.html',
  },
] as const;

export const fullLabSql = `-- Northstar Retail: OLAP lab from raw tables to cube query
-- Dialect: SQLite 3. Missing coordinates remain NULL, never silent zeroes.

PRAGMA foreign_keys = ON;
DROP VIEW IF EXISTS v_month_region_category;
DROP TABLE IF EXISTS fact_sales;
DROP TABLE IF EXISTS dim_customer;
DROP TABLE IF EXISTS dim_store;
DROP TABLE IF EXISTS dim_product;
DROP TABLE IF EXISTS dim_date;
DROP TABLE IF EXISTS etl_metadata;
DROP TABLE IF EXISTS raw_order_lines;
DROP TABLE IF EXISTS raw_orders;
DROP TABLE IF EXISTS raw_stores;
DROP TABLE IF EXISTS raw_products;
DROP TABLE IF EXISTS raw_customers;

CREATE TABLE raw_customers (
  customer_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE raw_products (
  product_id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL
);
CREATE TABLE raw_stores (
  store_id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  region TEXT NOT NULL
);
CREATE TABLE raw_orders (
  order_id INTEGER PRIMARY KEY,
  order_date TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES raw_customers(customer_id),
  store_id TEXT NOT NULL REFERENCES raw_stores(store_id),
  status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled'))
);
CREATE TABLE raw_order_lines (
  order_id INTEGER NOT NULL REFERENCES raw_orders(order_id),
  line_no INTEGER NOT NULL,
  product_id TEXT NOT NULL REFERENCES raw_products(product_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  discount_amount INTEGER NOT NULL CHECK (discount_amount >= 0),
  PRIMARY KEY (order_id, line_no)
);
CREATE TABLE etl_metadata (
  dataset_id TEXT PRIMARY KEY,
  loaded_at TEXT NOT NULL,
  data_through TEXT NOT NULL
);

INSERT INTO raw_customers VALUES
 ('C001','Asha Rao','Bengaluru'),
 ('C002','Kabir Shah','Mumbai'),
 ('C003','Meera Sen','Chennai');
INSERT INTO raw_products VALUES
 ('P01','T-Shirt','Apparel'),('P02','Jeans','Apparel'),
 ('P03','Kettle','Home'),('P04','Lamp','Home');
INSERT INTO raw_stores VALUES
 ('S01','Marina Store','South'),
 ('S02','Capital Store','North'),
 ('S03','Harbor Store','West');
INSERT INTO raw_orders VALUES
 (1001,'2026-01-05','C001','S01','completed'),
 (1002,'2026-01-12','C002','S03','completed'),
 (1003,'2026-02-03','C003','S01','completed'),
 (1004,'2026-02-14','C001','S02','completed'),
 (1005,'2026-04-08','C002','S03','completed'),
 (1006,'2026-02-20','C003','S03','cancelled');
INSERT INTO raw_order_lines VALUES
 (1001,1,'P01',1,1000,100),(1001,2,'P03',1,1300,100),
 (1002,1,'P02',2,900,200),(1002,2,'P04',1,3000,300),
 (1003,1,'P01',2,800,100),(1003,2,'P02',2,950,100),
 (1004,1,'P03',2,1800,0),(1004,2,'P04',1,3250,250),
 (1005,1,'P01',1,600,100),(1005,2,'P03',1,3100,100),
 (1006,1,'P03',2,3000,0);
INSERT INTO etl_metadata VALUES
 ('northstar-retail-v1','2026-04-30T06:00:00Z','2026-04-30');

CREATE TABLE dim_product (
  product_key INTEGER PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL
);
CREATE TABLE dim_store (
  store_key INTEGER PRIMARY KEY,
  store_id TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  region TEXT NOT NULL
);
CREATE TABLE dim_customer (
  customer_key INTEGER PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE dim_date (
  date_key INTEGER PRIMARY KEY,
  full_date TEXT NOT NULL UNIQUE,
  day_of_month INTEGER NOT NULL,
  month_number INTEGER NOT NULL,
  month_name TEXT NOT NULL,
  quarter_name TEXT NOT NULL,
  year_number INTEGER NOT NULL
);
CREATE TABLE fact_sales (
  order_id INTEGER NOT NULL,
  line_no INTEGER NOT NULL,
  date_key INTEGER NOT NULL REFERENCES dim_date(date_key),
  product_key INTEGER NOT NULL REFERENCES dim_product(product_key),
  store_key INTEGER NOT NULL REFERENCES dim_store(store_key),
  customer_key INTEGER NOT NULL REFERENCES dim_customer(customer_key),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  gross_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  net_amount INTEGER NOT NULL,
  PRIMARY KEY (order_id, line_no),
  CHECK (gross_amount - discount_amount = net_amount)
);

-- Load dimensions first.
INSERT INTO dim_product
SELECT ROW_NUMBER() OVER (ORDER BY product_id), product_id, product_name, category
FROM raw_products;
INSERT INTO dim_store
SELECT ROW_NUMBER() OVER (ORDER BY store_id), store_id, store_name, region
FROM raw_stores;
INSERT INTO dim_customer
SELECT ROW_NUMBER() OVER (ORDER BY customer_id), customer_id, customer_name, city
FROM raw_customers;
WITH RECURSIVE dates(full_date) AS (
  VALUES ('2026-01-01')
  UNION ALL
  SELECT date(full_date, '+1 day') FROM dates
  WHERE full_date < '2026-04-30'
)
INSERT INTO dim_date
SELECT CAST(strftime('%Y%m%d', full_date) AS INTEGER), full_date,
       CAST(strftime('%d', full_date) AS INTEGER),
       CAST(strftime('%m', full_date) AS INTEGER),
       CASE strftime('%m', full_date)
         WHEN '01' THEN 'January' WHEN '02' THEN 'February'
         WHEN '03' THEN 'March' WHEN '04' THEN 'April' END,
       CASE WHEN strftime('%m', full_date) IN ('01','02','03') THEN 'Q1' ELSE 'Q2' END,
       CAST(strftime('%Y', full_date) AS INTEGER)
FROM dates;

INSERT INTO fact_sales
SELECT o.order_id, l.line_no,
       CAST(replace(o.order_date, '-', '') AS INTEGER),
       p.product_key, s.store_key, c.customer_key,
       l.quantity, l.quantity * l.unit_price, l.discount_amount,
       l.quantity * l.unit_price - l.discount_amount
FROM raw_orders o
JOIN raw_order_lines l ON l.order_id = o.order_id
JOIN dim_product p ON p.product_id = l.product_id
JOIN dim_store s ON s.store_id = o.store_id
JOIN dim_customer c ON c.customer_id = o.customer_id
WHERE o.status = 'completed';

CREATE VIEW v_month_region_category AS
SELECT d.month_number, d.month_name, s.region, p.category,
       SUM(f.net_amount) AS net_sales
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_store AS s ON s.store_key = f.store_key
JOIN dim_product AS p ON p.product_key = f.product_key
GROUP BY d.month_number, d.month_name, s.region, p.category;

-- The logical cube.
SELECT d.year_number, d.month_number, d.month_name,
       s.region, p.category, SUM(f.net_amount) AS net_sales
FROM fact_sales f
JOIN dim_date d ON d.date_key = f.date_key
JOIN dim_store s ON s.store_key = f.store_key
JOIN dim_product p ON p.product_key = f.product_key
GROUP BY d.year_number, d.month_number, d.month_name, s.region, p.category
ORDER BY d.year_number, d.month_number, s.region, p.category;

-- Complete Jan-Apr coordinate scaffold: 8 observed cells and 16 missing cells.
WITH months AS (
  SELECT DISTINCT month_number, month_name FROM dim_date
),
regions(region) AS (VALUES ('North'), ('South'), ('West')),
categories(category) AS (VALUES ('Apparel'), ('Home'))
SELECT m.month_name, r.region, c.category, cube.net_sales
FROM months AS m
CROSS JOIN regions AS r
CROSS JOIN categories AS c
LEFT JOIN v_month_region_category AS cube
  ON cube.month_number = m.month_number
 AND cube.region = r.region
 AND cube.category = c.category
ORDER BY m.month_number, r.region, c.category;

-- Reconciliation gate: 10 facts, 14 units, 21150 gross, 1350 discounts, 19800 net.
SELECT COUNT(*) AS fact_rows, COUNT(DISTINCT order_id) AS orders,
       SUM(quantity) AS units, SUM(gross_amount) AS gross,
       SUM(discount_amount) AS discounts, SUM(net_amount) AS net
FROM fact_sales;
`;
