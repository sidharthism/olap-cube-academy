import {
  factRows,
  rawCustomers,
  rawLines,
  rawOrders,
  rawProducts,
  rawStores,
} from './course-data.ts';

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

function values(rows: Array<Array<string | number>>) {
  return rows.map((row) => `(${row.map((value) => typeof value === 'number' ? String(value) : sqlString(value)).join(', ')})`).join(',\n');
}

const rawCustomerValues = values(rawCustomers.map((row) => [row.customerId, row.customerName, row.city]));
const rawProductValues = values(rawProducts.map((row) => [row.productId, row.productName, row.category]));
const rawStoreValues = values(rawStores.map((row) => [row.storeId, row.storeName, row.region]));
const rawOrderValues = values(rawOrders.map((row) => [row.orderId, row.orderDate, row.customerId, row.storeId, row.status]));
const rawLineValues = values(rawLines.map((row) => [row.orderId, row.lineNo, row.productId, row.quantity, row.unitPrice, row.discount]));
const dimProductValues = values(rawProducts.map((row, index) => [index + 1, row.productId, row.productName, row.category]));
const dimStoreValues = values(rawStores.map((row, index) => [index + 1, row.storeId, row.storeName, row.region]));
const dimCustomerValues = values(rawCustomers.map((row, index) => [index + 1, row.customerId, row.customerName, row.city]));
const factValues = values(factRows.map((row) => [
  row.order,
  row.line,
  Number(row.date.replaceAll('-', '')),
  rawProducts.findIndex((product) => product.productName === row.product) + 1,
  rawStores.findIndex((store) => store.storeName === row.store) + 1,
  rawCustomers.findIndex((customer) => customer.customerId === rawOrders.find((order) => order.orderId === row.order)?.customerId) + 1,
  row.quantity,
  row.gross,
  row.discount,
  row.net,
]));

/**
 * A DuckDB-native fixture for the browser runner.
 *
 * The downloadable lab intentionally remains SQLite so it can be used from
 * the command line. This seed uses the same rows and checksums, but avoids
 * SQLite-only PRAGMA/date syntax and can be reset for every learner query.
 */
export function getDuckdbBootstrapSql(includeFacts = true) {
  const statements = [
    'SET enable_external_access = false;',
    'DROP VIEW IF EXISTS v_month_region_category;',
    'DROP VIEW IF EXISTS v_completed_totals;',
    'DROP TABLE IF EXISTS monthly_region_category;',
    'DROP TABLE IF EXISTS fact_sales;',
    'DROP TABLE IF EXISTS dim_customer;',
    'DROP TABLE IF EXISTS dim_store;',
    'DROP TABLE IF EXISTS dim_product;',
    'DROP TABLE IF EXISTS dim_date;',
    'DROP TABLE IF EXISTS etl_metadata;',
    'DROP TABLE IF EXISTS raw_order_lines;',
    'DROP TABLE IF EXISTS raw_orders;',
    'DROP TABLE IF EXISTS raw_stores;',
    'DROP TABLE IF EXISTS raw_products;',
    'DROP TABLE IF EXISTS raw_customers;',
    `CREATE TABLE raw_customers (
      customer_id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      city TEXT NOT NULL
    );`,
    `INSERT INTO raw_customers VALUES\n${rawCustomerValues};`,
    `CREATE TABLE raw_products (
      product_id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL
    );`,
    `INSERT INTO raw_products VALUES\n${rawProductValues};`,
    `CREATE TABLE raw_stores (
      store_id TEXT PRIMARY KEY,
      store_name TEXT NOT NULL,
      region TEXT NOT NULL
    );`,
    `INSERT INTO raw_stores VALUES\n${rawStoreValues};`,
    `CREATE TABLE raw_orders (
      order_id INTEGER PRIMARY KEY,
      order_date TEXT NOT NULL,
      customer_id TEXT NOT NULL REFERENCES raw_customers(customer_id),
      store_id TEXT NOT NULL REFERENCES raw_stores(store_id),
      status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled'))
    );`,
    `INSERT INTO raw_orders VALUES\n${rawOrderValues};`,
    `CREATE TABLE raw_order_lines (
      order_id INTEGER NOT NULL REFERENCES raw_orders(order_id),
      line_no INTEGER NOT NULL,
      product_id TEXT NOT NULL REFERENCES raw_products(product_id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
      discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
      PRIMARY KEY (order_id, line_no)
    );`,
    `INSERT INTO raw_order_lines VALUES\n${rawLineValues};`,
    `CREATE TABLE etl_metadata (
      dataset_id TEXT PRIMARY KEY,
      loaded_at TEXT NOT NULL,
      data_through TEXT NOT NULL
    );`,
    "INSERT INTO etl_metadata VALUES ('northstar-retail-v1', '2026-04-30T06:00:00Z', '2026-04-30');",
    `CREATE TABLE dim_date (
      date_key INTEGER PRIMARY KEY,
      full_date DATE NOT NULL UNIQUE,
      day_of_month INTEGER NOT NULL,
      month_number INTEGER NOT NULL,
      month_name TEXT NOT NULL,
      quarter_name TEXT NOT NULL,
      year_number INTEGER NOT NULL
    );`,
    `INSERT INTO dim_date
      SELECT
        CAST(strftime(full_date, '%Y%m%d') AS INTEGER),
        CAST(full_date AS DATE),
        CAST(date_part('day', full_date) AS INTEGER),
        CAST(date_part('month', full_date) AS INTEGER),
        CASE date_part('month', full_date)
          WHEN 1 THEN 'January'
          WHEN 2 THEN 'February'
          WHEN 3 THEN 'March'
          WHEN 4 THEN 'April'
        END,
        CASE WHEN date_part('month', full_date) IN (1, 2, 3) THEN 'Q1' ELSE 'Q2' END,
        CAST(date_part('year', full_date) AS INTEGER)
      FROM generate_series(DATE '2026-01-01', DATE '2026-04-30', INTERVAL '1 day') AS dates(full_date);`,
    `CREATE TABLE dim_product (
      product_key INTEGER PRIMARY KEY,
      product_id TEXT NOT NULL UNIQUE,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL
    );`,
    `INSERT INTO dim_product VALUES\n${dimProductValues};`,
    `CREATE TABLE dim_store (
      store_key INTEGER PRIMARY KEY,
      store_id TEXT NOT NULL UNIQUE,
      store_name TEXT NOT NULL,
      region TEXT NOT NULL
    );`,
    `INSERT INTO dim_store VALUES\n${dimStoreValues};`,
    `CREATE TABLE dim_customer (
      customer_key INTEGER PRIMARY KEY,
      customer_id TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      city TEXT NOT NULL
    );`,
    `INSERT INTO dim_customer VALUES\n${dimCustomerValues};`,
  ];

  if (includeFacts) {
    statements.push(
      `CREATE TABLE fact_sales (
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
      );`,
      `INSERT INTO fact_sales VALUES\n${factValues};`,
      `CREATE VIEW v_completed_totals AS
        SELECT COUNT(*) AS fact_rows,
               SUM(quantity) AS units,
               SUM(gross_amount) AS gross_sales,
               SUM(discount_amount) AS discounts,
               SUM(net_amount) AS net_sales
        FROM fact_sales;`,
      `CREATE VIEW v_month_region_category AS
        SELECT d.month_number, d.month_name, s.region, p.category,
               SUM(f.net_amount) AS net_sales
        FROM fact_sales AS f
        JOIN dim_date AS d ON d.date_key = f.date_key
        JOIN dim_store AS s ON s.store_key = f.store_key
        JOIN dim_product AS p ON p.product_key = f.product_key
        GROUP BY d.month_number, d.month_name, s.region, p.category;`,
    );
  }

  statements.push(
    'SET enable_external_access = false;',
    'SET lock_configuration = true;',
  );

  return statements.join('\n\n');
}

export const duckdbLabSql = getDuckdbBootstrapSql(true);
