import assert from 'node:assert/strict';
import test from 'node:test';
import { duckdbLabSql, getDuckdbBootstrapSql } from '../app/duckdb-seed.ts';
import { parseSqlStatements } from '../app/sql-workspace.ts';

test('builds a complete, parseable DuckDB seed with browser safeguards', () => {
  const parsed = parseSqlStatements(duckdbLabSql);

  assert.equal(parsed.error, null);
  assert.ok(parsed.statements.length > 20);
  assert.equal(parsed.statements[0], 'SET enable_external_access = false');
  assert.equal(parsed.statements.at(-2), 'SET enable_external_access = false');
  assert.equal(parsed.statements.at(-1), 'SET lock_configuration = true');
  for (const table of ['raw_customers', 'raw_products', 'raw_stores', 'raw_orders', 'raw_order_lines', 'fact_sales']) {
    assert.match(duckdbLabSql, new RegExp(`CREATE TABLE ${table}\\b`), table);
  }
});

test('omits prebuilt facts for the chapter that teaches learners to create them', () => {
  const withoutFacts = getDuckdbBootstrapSql(false);
  const parsed = parseSqlStatements(withoutFacts);

  assert.equal(parsed.error, null);
  assert.match(withoutFacts, /CREATE TABLE raw_orders\b/);
  assert.match(withoutFacts, /CREATE TABLE dim_date\b/);
  assert.doesNotMatch(withoutFacts, /CREATE TABLE fact_sales\b/);
  assert.doesNotMatch(withoutFacts, /CREATE VIEW v_completed_totals\b/);
  assert.doesNotMatch(withoutFacts, /CREATE VIEW v_month_region_category\b/);
  assert.equal(parsed.statements.at(-1), 'SET lock_configuration = true');
});

test('includes prebuilt facts for analytical chapters by default', () => {
  const withFacts = getDuckdbBootstrapSql();

  assert.match(withFacts, /CREATE TABLE fact_sales\b/);
  assert.match(withFacts, /INSERT INTO fact_sales VALUES\b/);
  assert.match(withFacts, /CREATE VIEW v_completed_totals\b/);
  assert.match(withFacts, /CREATE VIEW v_month_region_category\b/);
});
