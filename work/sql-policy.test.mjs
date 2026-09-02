import assert from 'node:assert/strict';
import test from 'node:test';
import { validateLearnerSql } from '../app/sql-policy.ts';

test('allows normal analytical queries and sandbox experiments', () => {
  assert.deepEqual(validateLearnerSql([
    "SELECT 'DROP TABLE raw_orders' AS example;",
    'CREATE TEMP TABLE scratch AS SELECT 1 AS value;',
    'INSERT INTO scratch VALUES (2);',
    'UPDATE scratch SET value = value + 1;',
  ], 1), { allowed: true });
});

test('ignores destructive words inside comments', () => {
  assert.deepEqual(validateLearnerSql([
    '-- DELETE FROM raw_orders;\nSELECT COUNT(*) FROM raw_orders;',
    '/* DROP TABLE raw_orders; */ SELECT 1;',
  ], 1), { allowed: true });
});

test('blocks DELETE statements in every chapter', () => {
  const result = validateLearnerSql(['WITH doomed AS (SELECT 1004 AS order_id) DELETE FROM raw_orders WHERE order_id IN (SELECT order_id FROM doomed);'], 1);
  assert.equal(result.allowed, false);
  if (!result.allowed) assert.equal(result.keyword, 'DELETE');
});

test('blocks arbitrary DROP statements even in the chapter with a maintenance exception', () => {
  const result = validateLearnerSql(['DROP TABLE raw_orders;'], 14);
  assert.equal(result.allowed, false);
  if (!result.allowed) assert.equal(result.keyword, 'DROP');
});

test('allows only the exact chapter 14 pre-aggregation cleanup step', () => {
  assert.deepEqual(validateLearnerSql(['DROP TABLE IF EXISTS monthly_region_category;'], 14), { allowed: true });
  assert.deepEqual(validateLearnerSql(['DROP /* safe? */ TABLE IF EXISTS monthly_region_category;'], 14), { allowed: true });
  assert.deepEqual(validateLearnerSql(['DROP TABLE IF EXISTS monthly_region_category;'], 13), {
    allowed: false,
    keyword: 'DROP',
    statementIndex: 0,
    message: 'DROP statements are blocked in the browser lab. This chapter does not require destructive data or schema changes.',
  });
});

test('blocks other destructive or external-access commands', () => {
  for (const keyword of ['TRUNCATE', 'ALTER', 'ATTACH', 'DETACH', 'COPY', 'EXPORT', 'IMPORT', 'INSTALL', 'LOAD', 'VACUUM', 'BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'RELEASE']) {
    const result = validateLearnerSql([`${keyword} something;`], 1);
    assert.equal(result.allowed, false, keyword);
    if (!result.allowed) assert.equal(result.keyword, keyword, keyword);
  }
});

test('explains why transaction commands are managed by the lab', () => {
  const result = validateLearnerSql(['BEGIN TRANSACTION;'], 1);
  assert.equal(result.allowed, false);
  if (!result.allowed) assert.match(result.message, /Transaction control is managed/);
});

test('explains why external-access commands are blocked', () => {
  const result = validateLearnerSql(['COPY raw_orders TO \'orders.csv\';'], 1);
  assert.equal(result.allowed, false);
  if (!result.allowed) assert.match(result.message, /External I\/O/);
});
