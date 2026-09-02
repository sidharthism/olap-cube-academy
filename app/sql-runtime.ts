import { canExplainStatement, isReadOnlyStatement } from './sql-workspace.ts';

export const PREVIEW_ROW_LIMIT = 200;
export const QUERY_TIMEOUT_MS = 8_000;

export type ResultValue = string | number | boolean | null;

export type QueryResult = {
  columns: string[];
  rows: ResultValue[][];
  totalRows: number;
  truncated: boolean;
};

type DuckDbTable = {
  schema: { fields: Array<{ name: string }> };
  toArray: () => unknown[];
  numRows: number;
  numCols: number;
};

type DuckDbConnection<Result = unknown> = {
  query: (sql: string) => Promise<Result>;
};

export function normalizeDuckDbValue(value: unknown): ResultValue {
  if (value === null || value === undefined) return null;
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString().replace('T', ' ').replace('.000Z', ' UTC');
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return String(value);
}

export function tableToResult(table: DuckDbTable, rowLimit = PREVIEW_ROW_LIMIT): QueryResult | null {
  if (table.numCols === 0) return null;
  const columns = table.schema.fields.map((field) => field.name);
  const rows = table.toArray().slice(0, rowLimit).map((row) => {
    const record = row as Record<string, unknown>;
    return columns.map((column) => normalizeDuckDbValue(record[column]));
  });
  return {
    columns,
    rows,
    totalRows: table.numRows,
    truncated: table.numRows > rowLimit,
  };
}

export async function queryWithTimeout<Result>(connection: DuckDbConnection<Result>, sql: string, timeoutMs = QUERY_TIMEOUT_MS): Promise<Result> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutSeconds = Math.max(1, Math.ceil(timeoutMs / 1_000));
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`The query took longer than ${timeoutSeconds} ${timeoutSeconds === 1 ? 'second' : 'seconds'}. Try a smaller query or reset the lab.`)), timeoutMs);
  });
  try {
    return await Promise.race([connection.query(sql), timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function validateWithDuckDb(connection: DuckDbConnection, statements: string[]) {
  const readOnly = statements.every(isReadOnlyStatement);
  if (readOnly) {
    for (const statement of statements) {
      await queryWithTimeout(connection, canExplainStatement(statement) ? `EXPLAIN ${statement}` : statement);
    }
    return;
  }

  await connection.query('BEGIN TRANSACTION');
  try {
    for (const statement of statements) await queryWithTimeout(connection, statement);
  } finally {
    await connection.query('ROLLBACK').catch(() => undefined);
  }
}
