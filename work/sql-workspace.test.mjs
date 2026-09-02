import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSqlExamples,
  canExplainStatement,
  createSqlWorkspaceState,
  CUSTOM_SQL_LABEL,
  CUSTOM_SQL_OPTION,
  CUSTOM_SQL_TEMPLATE,
  editSqlWorkspace,
  friendlySqlError,
  parseSqlStatements,
  selectSqlOption,
} from '../site/app/sql-workspace.ts';

const chapterOneSql = `-- OLTP: find one event
SELECT * FROM raw_orders WHERE order_id = 1004;

-- OLAP: compare many completed events
SELECT region, SUM(net_amount) FROM fact_sales GROUP BY region;`;

test('uses short comment headings for the chapter 1 dropdown', () => {
  const examples = buildSqlExamples(chapterOneSql, 'One row versus many rows');
  assert.deepEqual(examples.map(({ id, label }) => ({ id, label })), [
    { id: 'example-0', label: 'OLTP: find one event' },
    { id: 'example-1', label: 'OLAP: compare many completed events' },
  ]);
  assert.match(examples[0].sql, /^-- OLTP: find one event/);
  assert.doesNotMatch(examples[0].sql, /OLAP:/);
});

test('keeps a dependent multi-statement lesson together as one preset', () => {
  const source = 'CREATE TABLE scratch(value INTEGER); INSERT INTO scratch VALUES (1);';
  assert.deepEqual(buildSqlExamples(source, 'Build a scratch table'), [
    { id: 'example-0', label: 'Build a scratch table', sql: source },
  ]);
});

test('ignores trailing comment-only fragments when parsing', () => {
  const parsed = parseSqlStatements('SELECT 1;\n-- expected: 1');
  assert.equal(parsed.error, null);
  assert.deepEqual(parsed.statements, ['SELECT 1']);
});

test('recognizes explainable queries after multiple leading comments', () => {
  assert.equal(canExplainStatement('-- first\n-- second\nWITH answer AS (SELECT 42 AS value) SELECT * FROM answer;'), true);
});

test('reports unfinished quotes and block comments before execution', () => {
  assert.match(parseSqlStatements("SELECT 'unfinished").error ?? '', /not closed/);
  assert.match(parseSqlStatements('SELECT 1 /* unfinished').error ?? '', /not closed/);
});

test('does not split statements at semicolons inside comments or quoted values', () => {
  const parsed = parseSqlStatements(`-- a comment; still a comment
SELECT 'north;star' AS label;
/* another; comment */ SELECT "semi;colon" AS value;`);
  assert.equal(parsed.error, null);
  assert.equal(parsed.statements.length, 2);
  assert.match(parsed.statements[0], /'north;star'/);
  assert.match(parsed.statements[1], /"semi;colon"/);
});

test('provides a useful custom-query option and starter', () => {
  assert.equal(CUSTOM_SQL_OPTION, 'custom');
  assert.match(CUSTOM_SQL_LABEL, /Write my own SQL/);
  assert.match(CUSTOM_SQL_TEMPLATE, /FROM raw_orders/);
});

test('keeps dropdown and editor state synchronized through select, edit, and restore', () => {
  const examples = buildSqlExamples(chapterOneSql, 'One row versus many rows');
  const initial = createSqlWorkspaceState(examples);
  assert.equal(initial.selectedOption, 'example-0');
  assert.match(initial.sql, /OLTP: find one event/);

  const second = selectSqlOption(initial, examples, 'example-1');
  assert.equal(second.selectedOption, 'example-1');
  assert.match(second.sql, /OLAP: compare many completed events/);

  const edited = editSqlWorkspace(second, 'SELECT COUNT(*) FROM raw_orders;');
  assert.equal(edited.selectedOption, CUSTOM_SQL_OPTION);
  assert.equal(edited.sql, 'SELECT COUNT(*) FROM raw_orders;');

  const customAgain = selectSqlOption(selectSqlOption(edited, examples, 'example-0'), examples, CUSTOM_SQL_OPTION);
  assert.equal(customAgain.sql, 'SELECT COUNT(*) FROM raw_orders;');

  const restored = createSqlWorkspaceState(examples);
  assert.equal(restored.selectedOption, 'example-0');
  assert.match(restored.sql, /OLTP: find one event/);
});

test('falls back safely when a stale dropdown option no longer exists', () => {
  const examples = buildSqlExamples(chapterOneSql, 'One row versus many rows');
  const edited = editSqlWorkspace(createSqlWorkspaceState(examples), 'SELECT 42;');
  const selected = selectSqlOption(edited, examples, 'removed-example');

  assert.equal(selected.selectedOption, 'example-0');
  assert.equal(selected.sql, examples[0].sql);
  assert.equal(selected.customSql, 'SELECT 42;');
});

test('starts in custom mode when a chapter has no SQL examples', () => {
  assert.deepEqual(createSqlWorkspaceState([]), {
    selectedOption: CUSTOM_SQL_OPTION,
    sql: CUSTOM_SQL_TEMPLATE,
    customSql: CUSTOM_SQL_TEMPLATE,
  });
});

test('translates parser and catalog errors into learner-friendly messages', () => {
  assert.equal(
    friendlySqlError(new Error('Parser Error: syntax error at or near "FORM" LINE 1: SELECT * FORM raw_orders')),
    'The query engine is a tough critic! It could not understand that SQL. Check commas, quotes, parentheses, and clause order. Details: syntax error at or near "FORM"',
  );
  assert.match(friendlySqlError(new Error('Catalog Error: Table with name missing does not exist!')), /could not be found/);
  assert.match(friendlySqlError(new Error('Conversion Error: Could not convert string')), /value does not fit/);
  assert.equal(
    friendlySqlError(new Error('The query took longer than 8 seconds. Try a smaller query or reset the lab.')),
    'The query took longer than 8 seconds. Try a smaller query or reset the lab.',
  );
  assert.match(friendlySqlError('Unexpected worker failure'), /DuckDB could not run/);
});
