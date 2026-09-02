'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { chapterDetails, type CourseChapter, fullLabSql } from './course-data';
import { duckdbLabSql, getDuckdbBootstrapSql } from './duckdb-seed';
import { validateLearnerSql } from './sql-policy';
import {
  PREVIEW_ROW_LIMIT,
  queryWithTimeout,
  tableToResult,
  validateWithDuckDb,
  type QueryResult,
} from './sql-runtime';
import {
  buildSqlExamples,
  createSqlWorkspaceState,
  CUSTOM_SQL_LABEL,
  CUSTOM_SQL_OPTION,
  editSqlWorkspace,
  friendlySqlError,
  isReadOnlyStatement,
  parseSqlStatements,
  selectSqlOption,
} from './sql-workspace';

type Runtime = {
  db: AsyncDuckDB;
  connection: AsyncDuckDBConnection;
  worker: Worker;
};

function basePath() {
  const value = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

function assetUrl(name: string) {
  return new URL(`${basePath()}/duckdb/${name}`, window.location.origin).href;
}

async function disposeRuntime(runtime: Runtime | null) {
  if (!runtime) return;
  await runtime.connection.close().catch(() => undefined);
  await runtime.db.terminate().catch(() => undefined);
  runtime.worker.terminate();
}

async function createRuntime(includeFacts: boolean): Promise<Runtime> {
  const duckdb = await import('@duckdb/duckdb-wasm');
  const bundle = await duckdb.selectBundle({
    mvp: {
      mainModule: assetUrl('duckdb-mvp.wasm'),
      mainWorker: assetUrl('duckdb-browser-mvp.worker.js'),
    },
    eh: {
      mainModule: assetUrl('duckdb-eh.wasm'),
      mainWorker: assetUrl('duckdb-browser-eh.worker.js'),
    },
  });
  const worker = new Worker(bundle.mainWorker!, { type: 'classic' });
  const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);

  try {
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    await db.open({
      path: ':memory:',
      query: {
        castBigIntToDouble: true,
        castDecimalToDouble: true,
        castTimestampToDate: true,
      },
    });
    const connection = await db.connect();
    const bootstrap = parseSqlStatements(getDuckdbBootstrapSql(includeFacts));
    if (bootstrap.error) throw new Error(`The Northstar database could not start. ${bootstrap.error}`);
    for (const statement of bootstrap.statements) {
      await connection.query(statement);
    }
    return { db, connection, worker };
  } catch (error) {
    await db.terminate().catch(() => undefined);
    worker.terminate();
    throw error;
  }
}

function downloadText(name: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function SqlRunner({ chapter }: { chapter: CourseChapter }) {
  const detail = chapterDetails[chapter.number];
  const examples = useMemo(() => buildSqlExamples(detail.sql, detail.sqlTitle), [detail.sql, detail.sqlTitle]);
  const defaultExample = examples[0];
  const [workspace, setWorkspace] = useState(() => createSqlWorkspaceState(examples));
  const { selectedOption, sql } = workspace;
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState<'query' | 'policy' | 'validation'>('query');
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [runPhase, setRunPhase] = useState<'idle' | 'validating' | 'running'>('idle');
  const [engineReady, setEngineReady] = useState(false);
  const lastChapter = useRef(chapter.number);

  useEffect(() => {
    if (lastChapter.current === chapter.number) return;
    lastChapter.current = chapter.number;
    setWorkspace(createSqlWorkspaceState(examples));
    setResult(null);
    setError('');
    setErrorKind('query');
    setElapsedMs(null);
    setEngineReady(false);
    setRunPhase('idle');
  }, [chapter.number, defaultExample.id, defaultExample.sql, examples]);

  const parsedSql = useMemo(() => parseSqlStatements(sql), [sql]);
  const statements = parsedSql.statements;
  const readOnlyScript = !parsedSql.error && statements.length > 0 && statements.every(isReadOnlyStatement);
  const busy = runPhase !== 'idle';

  function clearRunFeedback() {
    setResult(null);
    setError('');
    setErrorKind('query');
    setElapsedMs(null);
    setEngineReady(false);
  }

  function chooseOption(optionId: string) {
    setWorkspace((current) => selectSqlOption(current, examples, optionId));
    clearRunFeedback();
  }

  function restoreDefault() {
    setWorkspace(createSqlWorkspaceState(examples));
    clearRunFeedback();
  }

  async function runSql() {
    if (busy) return;
    if (parsedSql.error) {
      setResult(null);
      setError(parsedSql.error);
      setErrorKind('validation');
      setElapsedMs(null);
      return;
    }
    if (!statements.length) {
      setResult(null);
      setError('Write a SQL statement first. Try SELECT * FROM raw_orders LIMIT 10;');
      setErrorKind('validation');
      setElapsedMs(null);
      return;
    }
    const policy = validateLearnerSql(statements, chapter.number);
    if (!policy.allowed) {
      setResult(null);
      setError(policy.message);
      setErrorKind('policy');
      setElapsedMs(null);
      return;
    }
    setRunPhase('validating');
    setError('');
    setErrorKind('query');
    setResult(null);
    setElapsedMs(null);
    let runtime: Runtime | null = null;
    let stage: 'setup' | 'validation' | 'execution' = 'setup';
    try {
      runtime = await createRuntime(chapter.number !== 4);
      stage = 'validation';
      await validateWithDuckDb(runtime.connection, statements);
      setRunPhase('running');
      stage = 'execution';
      const startedAt = performance.now();
      let latestResult: QueryResult | null = null;
      for (const statement of statements) {
        const table = await queryWithTimeout(runtime.connection, statement);
        const nextResult = tableToResult(table);
        if (nextResult) latestResult = nextResult;
      }

      if (!latestResult && chapter.number === 4) {
        const table = await queryWithTimeout(runtime.connection, 'SELECT COUNT(*) AS fact_rows, SUM(net_amount) AS net_sales FROM fact_sales;');
        latestResult = tableToResult(table);
      }
      if (!latestResult && chapter.number === 14) {
        const table = await queryWithTimeout(runtime.connection, 'SELECT COUNT(*) AS preaggregated_cells, SUM(net_sales) AS net_sales FROM monthly_region_category;');
        latestResult = tableToResult(table);
      }

      setResult(latestResult);
      setElapsedMs(Math.round(performance.now() - startedAt));
      setEngineReady(true);
    } catch (caught) {
      setError(friendlySqlError(caught));
      setErrorKind(stage === 'validation' ? 'validation' : 'query');
      setEngineReady(false);
    } finally {
      await disposeRuntime(runtime);
      setRunPhase('idle');
    }
  }

  async function copySql() {
    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      setErrorKind('query');
      setError('Copy was blocked by the browser. Select the SQL and copy it manually.');
    }
  }

  return (
    <div className="sql-lesson sql-runner">
      <div className="sql-titlebar">
        <div>
          <span className="eyebrow">{detail.sqlTitle}</span>
          <strong>SQL for chapter {chapter.number}</strong>
        </div>
        <span className={`sql-engine-status ${engineReady ? 'is-ready' : ''}`} aria-live="polite">
          {runPhase === 'validating' ? 'Checking SQL…' : runPhase === 'running' ? 'Running query…' : engineReady ? 'DuckDB ready ✓' : 'Runs in your browser'}
        </span>
      </div>

      <div className="sql-statement-picker">
        <label htmlFor={`sql-statement-${chapter.number}`}>Choose a query to run</label>
        <select
          id={`sql-statement-${chapter.number}`}
          value={selectedOption}
          onChange={(event) => chooseOption(event.target.value)}
          disabled={busy}
        >
          {examples.map((example) => <option value={example.id} key={example.id}>{example.label}</option>)}
          <option value={CUSTOM_SQL_OPTION}>{CUSTOM_SQL_LABEL}</option>
        </select>
      </div>

      <label className="sr-only" htmlFor={`sql-editor-${chapter.number}`}>Editable SQL query</label>
      <textarea
        id={`sql-editor-${chapter.number}`}
        className="sql-editor"
        value={sql}
        onChange={(event) => {
          setWorkspace((current) => editSqlWorkspace(current, event.target.value));
          setResult(null);
          setError('');
          setErrorKind('query');
        }}
        spellCheck={false}
        aria-describedby={`sql-help-${chapter.number}`}
        disabled={busy}
      />

      <div className="sql-runner-controls">
        <button type="button" className="primary-button" onClick={runSql} disabled={busy}>
          {runPhase === 'validating' ? 'Checking…' : runPhase === 'running' ? 'Running…' : 'Run query'}
        </button>
        <button type="button" className="quiet-button" onClick={restoreDefault} disabled={busy}>
          Restore example
        </button>
        <button type="button" className="quiet-button" onClick={copySql} disabled={busy}>Copy SQL</button>
      </div>

      <div className="sql-actions">
        <button type="button" className="text-button" onClick={() => downloadText('northstar-olap-lab.sql', fullLabSql, 'text/sql')}>Download SQLite lab</button>
        <button type="button" className="text-button" onClick={() => downloadText('northstar-olap-lab.duckdb.sql', duckdbLabSql, 'text/sql')}>Download DuckDB seed</button>
      </div>
      <p id={`sql-help-${chapter.number}`} className="sql-runner-help">
        {readOnlyScript ? 'Each run starts with a clean Northstar database. Query results stay in this browser. DELETE, DROP, and external-access commands are blocked except for an exact chapter maintenance step.' : 'This script runs in a resettable Northstar database, so schema experiments cannot change your saved course progress. DELETE, DROP, and external-access commands are blocked except for an exact chapter maintenance step.'}
      </p>

      {error && <div className="sql-error" role="alert"><strong>{errorKind === 'policy' ? 'Query blocked' : errorKind === 'validation' ? 'Seems like a syntax flurry!' : 'Query failed'}</strong><code>{error}</code></div>}

      {result ? (
        <div className="sql-result" aria-live="polite">
          <div className="sql-result-heading">
            <div><span className="eyebrow">Query result</span><strong>{result.totalRows} {result.totalRows === 1 ? 'row' : 'rows'}</strong></div>
            {elapsedMs !== null && <span>{elapsedMs} ms</span>}
          </div>
          <div className="table-scroll">
            <table className="data-table sql-result-table">
              <thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
              <tbody>{result.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, columnIndex) => <td key={`${rowIndex}-${columnIndex}`}>{value === null ? <span className="sql-null">NULL</span> : String(value)}</td>)}</tr>)}</tbody>
            </table>
          </div>
          {result.truncated && <p className="sql-result-note">Showing the first {PREVIEW_ROW_LIMIT} rows.</p>}
        </div>
      ) : !busy && engineReady && !error ? (
        <div className="sql-empty-result" role="status">Script completed without a tabular result. Try a SELECT to inspect the tables.</div>
      ) : null}
    </div>
  );
}
