import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeDuckDbValue,
  PREVIEW_ROW_LIMIT,
  queryWithTimeout,
  tableToResult,
  validateWithDuckDb,
} from '../app/sql-runtime.ts';

function fakeTable(rows, columns = Object.keys(rows[0] ?? {}), numRows = rows.length) {
  return {
    schema: { fields: columns.map((name) => ({ name })) },
    toArray: () => rows,
    numRows,
    numCols: columns.length,
  };
}

function recordingConnection(handler = async (sql) => ({ sql })) {
  const calls = [];
  return {
    calls,
    connection: {
      async query(sql) {
        calls.push(sql);
        return handler(sql);
      },
    },
  };
}

test('normalizes DuckDB values for safe table rendering', () => {
  assert.equal(normalizeDuckDbValue(42n), '42');
  assert.equal(normalizeDuckDbValue(new Date('2026-08-28T10:30:00.000Z')), '2026-08-28 10:30:00 UTC');
  assert.equal(normalizeDuckDbValue(undefined), null);
  assert.equal(normalizeDuckDbValue(false), false);
  assert.equal(normalizeDuckDbValue({ answer: 42 }), '[object Object]');
});

test('converts DuckDB tables into a bounded result preview', () => {
  const rows = Array.from({ length: PREVIEW_ROW_LIMIT + 1 }, (_, index) => ({
    row_number: BigInt(index + 1),
    note: index === 0 ? null : `row ${index + 1}`,
  }));
  const result = tableToResult(fakeTable(rows));

  assert.ok(result);
  assert.deepEqual(result.columns, ['row_number', 'note']);
  assert.deepEqual(result.rows[0], ['1', null]);
  assert.equal(result.rows.length, PREVIEW_ROW_LIMIT);
  assert.equal(result.totalRows, PREVIEW_ROW_LIMIT + 1);
  assert.equal(result.truncated, true);
});

test('returns no result for DuckDB statements without columns', () => {
  assert.equal(tableToResult(fakeTable([], [], 0)), null);
});

test('runs explainable read-only statements through EXPLAIN before execution', async () => {
  const { connection, calls } = recordingConnection();
  await validateWithDuckDb(connection, [
    'SELECT * FROM raw_orders',
    'WITH totals AS (SELECT COUNT(*) AS count FROM raw_orders) SELECT * FROM totals',
    'SHOW TABLES',
  ]);

  assert.deepEqual(calls, [
    'EXPLAIN SELECT * FROM raw_orders',
    'EXPLAIN WITH totals AS (SELECT COUNT(*) AS count FROM raw_orders) SELECT * FROM totals',
    'SHOW TABLES',
  ]);
  assert.doesNotMatch(calls.join('\n'), /BEGIN TRANSACTION|ROLLBACK/);
});

test('validates schema experiments in a transaction and rolls them back', async () => {
  const { connection, calls } = recordingConnection();
  await validateWithDuckDb(connection, [
    'CREATE TEMP TABLE scratch(value INTEGER)',
    'INSERT INTO scratch VALUES (42)',
  ]);

  assert.deepEqual(calls, [
    'BEGIN TRANSACTION',
    'CREATE TEMP TABLE scratch(value INTEGER)',
    'INSERT INTO scratch VALUES (42)',
    'ROLLBACK',
  ]);
});

test('rolls back validation when a schema experiment fails', async () => {
  const { connection, calls } = recordingConnection(async (sql) => {
    if (sql.startsWith('INSERT')) throw new Error('Constraint Error: duplicate key');
    return { sql };
  });

  await assert.rejects(
    validateWithDuckDb(connection, [
      'CREATE TEMP TABLE scratch(value INTEGER)',
      'INSERT INTO scratch VALUES (1)',
    ]),
    /duplicate key/,
  );
  assert.equal(calls.at(-1), 'ROLLBACK');
});

test('preserves the original SQL error when rollback cleanup also fails', async () => {
  const { connection, calls } = recordingConnection(async (sql) => {
    if (sql.startsWith('INSERT')) throw new Error('Constraint Error: duplicate key');
    if (sql === 'ROLLBACK') throw new Error('Rollback cleanup failed');
    return { sql };
  });

  await assert.rejects(
    validateWithDuckDb(connection, [
      'CREATE TEMP TABLE scratch(value INTEGER)',
      'INSERT INTO scratch VALUES (1)',
    ]),
    /Constraint Error: duplicate key/,
  );
  assert.equal(calls.at(-1), 'ROLLBACK');
});

test('returns a fast query result and rejects a query that exceeds its deadline', async () => {
  const fast = { query: async (sql) => `ran ${sql}` };
  assert.equal(await queryWithTimeout(fast, 'SELECT 42', 50), 'ran SELECT 42');

  const stalled = { query: async () => new Promise(() => {}) };
  await assert.rejects(queryWithTimeout(stalled, 'SELECT * FROM large_table', 5), /longer than 1 second/);
});
