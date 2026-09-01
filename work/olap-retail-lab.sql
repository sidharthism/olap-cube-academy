-- The Decision Room: deterministic OLAP practice dataset
-- Dialect: SQLite 3
-- Currency: whole Indian rupees
--
-- Authoritative completed-sales checksums:
--   fact rows       10
--   quantity        14
--   gross amount    21150
--   discount amount 1350
--   net amount      19800
--
-- Order 1006 is cancelled. Its one ₹6000 Kettle line remains in the raw
-- evidence but must not enter fact_sales.

PRAGMA foreign_keys = ON;

DROP VIEW IF EXISTS v_month_region_category;
DROP VIEW IF EXISTS v_completed_totals;
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
  customer_id   TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  city          TEXT NOT NULL
);

CREATE TABLE raw_products (
  product_id   TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category     TEXT NOT NULL
);

CREATE TABLE raw_stores (
  store_id   TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  region     TEXT NOT NULL
);

CREATE TABLE raw_orders (
  order_id   INTEGER PRIMARY KEY,
  order_date TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES raw_customers(customer_id),
  store_id    TEXT NOT NULL REFERENCES raw_stores(store_id),
  status      TEXT NOT NULL CHECK (status IN ('completed', 'cancelled'))
);

CREATE TABLE raw_order_lines (
  order_id        INTEGER NOT NULL REFERENCES raw_orders(order_id),
  line_no         INTEGER NOT NULL,
  product_id      TEXT NOT NULL REFERENCES raw_products(product_id),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      INTEGER NOT NULL CHECK (unit_price >= 0),
  discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  PRIMARY KEY (order_id, line_no)
);

CREATE TABLE etl_metadata (
  dataset_id   TEXT PRIMARY KEY,
  loaded_at    TEXT NOT NULL,
  data_through TEXT NOT NULL
);

INSERT INTO raw_customers VALUES
  ('C001', 'Asha Rao',  'Bengaluru'),
  ('C002', 'Kabir Shah','Mumbai'),
  ('C003', 'Meera Sen', 'Chennai');

INSERT INTO raw_products VALUES
  ('P01', 'T-Shirt', 'Apparel'),
  ('P02', 'Jeans',   'Apparel'),
  ('P03', 'Kettle',  'Home'),
  ('P04', 'Lamp',    'Home');

INSERT INTO raw_stores VALUES
  ('S01', 'Marina Store',  'South'),
  ('S02', 'Capital Store', 'North'),
  ('S03', 'Harbor Store',  'West');

INSERT INTO raw_orders VALUES
  (1001, '2026-01-05', 'C001', 'S01', 'completed'),
  (1002, '2026-01-12', 'C002', 'S03', 'completed'),
  (1003, '2026-02-03', 'C003', 'S01', 'completed'),
  (1004, '2026-02-14', 'C001', 'S02', 'completed'),
  (1005, '2026-04-08', 'C002', 'S03', 'completed'),
  (1006, '2026-02-20', 'C003', 'S03', 'cancelled');

INSERT INTO raw_order_lines VALUES
  (1001, 1, 'P01', 1, 1000, 100),
  (1001, 2, 'P03', 1, 1300, 100),
  (1002, 1, 'P02', 2,  900, 200),
  (1002, 2, 'P04', 1, 3000, 300),
  (1003, 1, 'P01', 2,  800, 100),
  (1003, 2, 'P02', 2,  950, 100),
  (1004, 1, 'P03', 2, 1800,   0),
  (1004, 2, 'P04', 1, 3250, 250),
  (1005, 1, 'P01', 1,  600, 100),
  (1005, 2, 'P03', 1, 3100, 100),
  (1006, 1, 'P03', 2, 3000,   0);

INSERT INTO etl_metadata VALUES
  ('northstar-retail-v1', '2026-04-30T06:00:00Z', '2026-04-30');

-- The date dimension is continuous. March is present even though March has
-- no completed facts. That lets the lab show “missing” instead of pretending
-- the month does not exist.
CREATE TABLE dim_date (
  date_key     INTEGER PRIMARY KEY,
  full_date    TEXT NOT NULL UNIQUE,
  day_of_month INTEGER NOT NULL,
  month_number INTEGER NOT NULL,
  month_name   TEXT NOT NULL,
  quarter_name TEXT NOT NULL,
  year_number  INTEGER NOT NULL
);

WITH RECURSIVE dates(full_date) AS (
  VALUES ('2026-01-01')
  UNION ALL
  SELECT date(full_date, '+1 day')
  FROM dates
  WHERE full_date < '2026-04-30'
)
INSERT INTO dim_date
SELECT
  CAST(strftime('%Y%m%d', full_date) AS INTEGER),
  full_date,
  CAST(strftime('%d', full_date) AS INTEGER),
  CAST(strftime('%m', full_date) AS INTEGER),
  CASE strftime('%m', full_date)
    WHEN '01' THEN 'January'
    WHEN '02' THEN 'February'
    WHEN '03' THEN 'March'
    WHEN '04' THEN 'April'
  END,
  CASE
    WHEN strftime('%m', full_date) IN ('01', '02', '03') THEN 'Q1'
    ELSE 'Q2'
  END,
  CAST(strftime('%Y', full_date) AS INTEGER)
FROM dates;

CREATE TABLE dim_product (
  product_key  INTEGER PRIMARY KEY,
  product_id   TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  category     TEXT NOT NULL
);

CREATE TABLE dim_store (
  store_key  INTEGER PRIMARY KEY,
  store_id   TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  region     TEXT NOT NULL
);

CREATE TABLE dim_customer (
  customer_key  INTEGER PRIMARY KEY,
  customer_id   TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  city          TEXT NOT NULL
);

INSERT INTO dim_product
SELECT
  ROW_NUMBER() OVER (ORDER BY product_id),
  product_id,
  product_name,
  category
FROM raw_products;

INSERT INTO dim_store
SELECT
  ROW_NUMBER() OVER (ORDER BY store_id),
  store_id,
  store_name,
  region
FROM raw_stores;

INSERT INTO dim_customer
SELECT
  ROW_NUMBER() OVER (ORDER BY customer_id),
  customer_id,
  customer_name,
  city
FROM raw_customers;

-- Grain: one product line on one completed order.
CREATE TABLE fact_sales (
  order_id        INTEGER NOT NULL,
  line_no         INTEGER NOT NULL,
  date_key        INTEGER NOT NULL REFERENCES dim_date(date_key),
  product_key     INTEGER NOT NULL REFERENCES dim_product(product_key),
  store_key       INTEGER NOT NULL REFERENCES dim_store(store_key),
  customer_key    INTEGER NOT NULL REFERENCES dim_customer(customer_key),
  quantity        INTEGER NOT NULL,
  gross_amount    INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  net_amount      INTEGER NOT NULL,
  PRIMARY KEY (order_id, line_no),
  CHECK (gross_amount - discount_amount = net_amount)
);

INSERT INTO fact_sales
SELECT
  o.order_id,
  l.line_no,
  CAST(replace(o.order_date, '-', '') AS INTEGER),
  p.product_key,
  s.store_key,
  c.customer_key,
  l.quantity,
  l.quantity * l.unit_price,
  l.discount_amount,
  (l.quantity * l.unit_price) - l.discount_amount
FROM raw_orders AS o
JOIN raw_order_lines AS l ON l.order_id = o.order_id
JOIN dim_product AS p ON p.product_id = l.product_id
JOIN dim_store AS s ON s.store_id = o.store_id
JOIN dim_customer AS c ON c.customer_id = o.customer_id
WHERE o.status = 'completed';

CREATE VIEW v_completed_totals AS
SELECT
  COUNT(*) AS fact_rows,
  SUM(quantity) AS units,
  SUM(gross_amount) AS gross_sales,
  SUM(discount_amount) AS discounts,
  SUM(net_amount) AS net_sales
FROM fact_sales;

CREATE VIEW v_month_region_category AS
SELECT
  d.month_number,
  d.month_name,
  s.region,
  p.category,
  SUM(f.net_amount) AS net_sales
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_store AS s ON s.store_key = f.store_key
JOIN dim_product AS p ON p.product_key = f.product_key
GROUP BY
  d.month_number,
  d.month_name,
  s.region,
  p.category;

-- Check 1: raw evidence counts.
SELECT
  'raw counts' AS check_name,
  CASE
    WHEN (SELECT COUNT(*) FROM raw_orders) = 6
     AND (SELECT COUNT(*) FROM raw_order_lines) = 11
    THEN 'PASS' ELSE 'FAIL'
  END AS result;

-- Check 2: the fact grain and totals.
SELECT
  'completed fact checksum' AS check_name,
  CASE
    WHEN fact_rows = 10
     AND units = 14
     AND gross_sales = 21150
     AND discounts = 1350
     AND net_sales = 19800
    THEN 'PASS' ELSE 'FAIL'
  END AS result
FROM v_completed_totals;

-- Check 3: the cancelled ₹6000 line remains raw and is excluded from facts.
SELECT
  'cancelled order excluded' AS check_name,
  CASE
    WHEN (
      SELECT SUM(l.quantity * l.unit_price - l.discount_amount)
      FROM raw_orders AS o
      JOIN raw_order_lines AS l ON l.order_id = o.order_id
      WHERE o.status = 'cancelled'
    ) = 6000
    AND NOT EXISTS (SELECT 1 FROM fact_sales WHERE order_id = 1006)
    THEN 'PASS' ELSE 'FAIL'
  END AS result;

-- Check 4: every fact key resolves and every row balances.
SELECT
  'fact integrity' AS check_name,
  CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM fact_sales AS f
      LEFT JOIN dim_date AS d ON d.date_key = f.date_key
      LEFT JOIN dim_product AS p ON p.product_key = f.product_key
      LEFT JOIN dim_store AS s ON s.store_key = f.store_key
      LEFT JOIN dim_customer AS c ON c.customer_key = f.customer_key
      WHERE d.date_key IS NULL
         OR p.product_key IS NULL
         OR s.store_key IS NULL
         OR c.customer_key IS NULL
         OR f.gross_amount - f.discount_amount <> f.net_amount
    )
    THEN 'PASS' ELSE 'FAIL'
  END AS result;

-- Check 5: the freshness lesson reads explicit, reproducible load metadata.
SELECT
  'load metadata' AS check_name,
  CASE
    WHEN loaded_at = '2026-04-30T06:00:00Z'
     AND data_through = '2026-04-30'
    THEN 'PASS' ELSE 'FAIL'
  END AS result
FROM etl_metadata
WHERE dataset_id = 'northstar-retail-v1';

-- The eight populated Month × Region × Category cube cells.
SELECT month_name, region, category, net_sales
FROM v_month_region_category
ORDER BY month_number, region, category;

-- A complete Jan-Apr coordinate grid. NULL means there is no matching fact;
-- the learning UI must display it as “—”, not as ₹0.
WITH months AS (
  SELECT DISTINCT month_number, month_name
  FROM dim_date
),
regions(region) AS (
  VALUES ('North'), ('South'), ('West')
),
categories(category) AS (
  VALUES ('Apparel'), ('Home')
)
SELECT
  m.month_name,
  r.region,
  c.category,
  cube.net_sales
FROM months AS m
CROSS JOIN regions AS r
CROSS JOIN categories AS c
LEFT JOIN v_month_region_category AS cube
  ON cube.month_number = m.month_number
 AND cube.region = r.region
 AND cube.category = c.category
ORDER BY m.month_number, r.region, c.category;

-- Roll-up: month and quarter totals.
WITH months AS (
  SELECT DISTINCT year_number, month_number, month_name
  FROM dim_date
)
SELECT m.month_number, m.month_name, SUM(f.net_amount) AS net_sales
FROM months AS m
LEFT JOIN dim_date AS d
  ON d.year_number = m.year_number
 AND d.month_number = m.month_number
LEFT JOIN fact_sales AS f ON f.date_key = d.date_key
GROUP BY m.year_number, m.month_number, m.month_name
ORDER BY m.year_number, m.month_number;

SELECT d.year_number, d.quarter_name, SUM(f.net_amount) AS net_sales
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
GROUP BY d.year_number, d.quarter_name
ORDER BY d.year_number, d.quarter_name;

-- Slice: February only.
SELECT s.region, p.category, SUM(f.net_amount) AS net_sales
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_store AS s ON s.store_key = f.store_key
JOIN dim_product AS p ON p.product_key = f.product_key
WHERE d.month_number = 2
GROUP BY s.region, p.category
ORDER BY s.region, p.category;

-- Dice: Jan/Feb, South/West, Apparel.
SELECT d.month_name, s.region, SUM(f.net_amount) AS net_sales
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_store AS s ON s.store_key = f.store_key
JOIN dim_product AS p ON p.product_key = f.product_key
WHERE d.month_number IN (1, 2)
  AND s.region IN ('South', 'West')
  AND p.category = 'Apparel'
GROUP BY d.month_number, d.month_name, s.region
ORDER BY d.month_number, s.region;

-- Pivot: category columns. This changes presentation, not facts.
SELECT
  d.month_name,
  s.region,
  -- No ELSE 0: a category with no contributing fact stays NULL/missing.
  SUM(CASE WHEN p.category = 'Apparel' THEN f.net_amount END) AS apparel,
  SUM(CASE WHEN p.category = 'Home' THEN f.net_amount END) AS home,
  SUM(f.net_amount) AS total
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_store AS s ON s.store_key = f.store_key
JOIN dim_product AS p ON p.product_key = f.product_key
GROUP BY d.month_number, d.month_name, s.region
ORDER BY d.month_number, s.region;

-- Drill-through: source facts behind February × North × Home = ₹6600.
SELECT
  f.order_id,
  f.line_no,
  d.full_date,
  p.product_name,
  s.store_name,
  f.quantity,
  f.gross_amount,
  f.discount_amount,
  f.net_amount
FROM fact_sales AS f
JOIN dim_date AS d ON d.date_key = f.date_key
JOIN dim_product AS p ON p.product_key = f.product_key
JOIN dim_store AS s ON s.store_key = f.store_key
WHERE d.month_number = 2
  AND s.region = 'North'
  AND p.category = 'Home'
ORDER BY f.order_id, f.line_no;

-- SQLite does not implement GROUP BY CUBE. A production engine such as
-- PostgreSQL, DuckDB, Snowflake, BigQuery, or SQL Server uses its own supported
-- cube/grouping-set syntax. The course displays the standard conceptual form:
--
-- SELECT month_name, region, category, SUM(net_amount)
-- FROM ...
-- GROUP BY CUBE (month_name, region, category);
--
-- The eight grouping patterns are:
-- (month, region, category), (month, region), (month, category), (region, category),
-- (month), (region), (category), and () for the grand total.
--
-- ROLLUP follows ordered prefixes by removing trailing levels:
-- GROUP BY ROLLUP (month_name, region, category)
-- produces (month, region, category), (month, region), (month), and ().
--
-- GROUPING SETS requests only an explicit list:
-- GROUP BY GROUPING SETS (
--   (month_name, region, category), (month_name), (region), ()
-- );
--
-- SQLite has no native CUBE, ROLLUP, or GROUPING SETS. To emulate them,
-- write one grouped SELECT for every wanted level and combine them with
-- UNION ALL, adding literal grouping flags to identify each subtotal level.
