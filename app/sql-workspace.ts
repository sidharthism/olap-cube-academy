export const CUSTOM_SQL_OPTION = 'custom';
export const CUSTOM_SQL_LABEL = '✦ Write my own SQL — ask Northstar';
export const CUSTOM_SQL_TEMPLATE = `-- Your turn: ask the Northstar database a new question.
SELECT *
FROM raw_orders
LIMIT 10;`;

export type SqlExample = {
  id: string;
  label: string;
  sql: string;
};

export type SqlWorkspaceState = {
  selectedOption: string;
  sql: string;
  customSql: string;
};

export type ParsedSql = {
  statements: string[];
  error: string | null;
};

function executableSql(sql: string) {
  let result = '';
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (character === '\n') {
        lineComment = false;
        result += ' ';
      }
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        index += 1;
        blockComment = false;
        result += ' ';
      }
      continue;
    }
    if (quote) {
      result += character;
      if (character === quote) {
        if (next === quote) {
          result += next;
          index += 1;
        } else quote = null;
      }
      continue;
    }
    if (character === '-' && next === '-') {
      index += 1;
      lineComment = true;
      continue;
    }
    if (character === '/' && next === '*') {
      index += 1;
      blockComment = true;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') quote = character;
    result += character;
  }

  return result.trim();
}

export function parseSqlStatements(sql: string): ParsedSql {
  const statements: string[] = [];
  let current = '';
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;

  const pushCurrent = () => {
    const candidate = current.trim();
    if (candidate && executableSql(candidate)) statements.push(candidate);
    current = '';
  };

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      current += character;
      if (character === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      current += character;
      if (character === '*' && next === '/') {
        current += next;
        index += 1;
        blockComment = false;
      }
      continue;
    }
    if (quote) {
      current += character;
      if (character === quote) {
        if (next === quote) {
          current += next;
          index += 1;
        } else quote = null;
      }
      continue;
    }
    if (character === '-' && next === '-') {
      current += `${character}${next}`;
      index += 1;
      lineComment = true;
      continue;
    }
    if (character === '/' && next === '*') {
      current += `${character}${next}`;
      index += 1;
      blockComment = true;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
      current += character;
      continue;
    }
    if (character === ';') {
      pushCurrent();
      continue;
    }
    current += character;
  }

  if (quote) {
    return { statements: [], error: 'A quoted value or identifier is not closed. Add the matching quote and try again.' };
  }
  if (blockComment) {
    return { statements: [], error: 'A /* comment */ is not closed. Add */ and try again.' };
  }

  pushCurrent();
  return { statements, error: null };
}

export function isReadOnlyStatement(sql: string) {
  return /^(SELECT|WITH|EXPLAIN|SHOW|DESCRIBE|SUMMARIZE)\b/i.test(executableSql(sql));
}

export function canExplainStatement(sql: string) {
  return /^(SELECT|WITH)\b/i.test(executableSql(sql));
}

function leadingCommentLabel(sql: string) {
  return sql.match(/^\s*--\s*([^\n]+)/)?.[1].trim() ?? '';
}

function withSemicolon(sql: string) {
  return `${sql.trim().replace(/;+$/, '')};`;
}

export function buildSqlExamples(sourceSql: string, fallbackLabel: string): SqlExample[] {
  const parsed = parseSqlStatements(sourceSql);
  const canSplit = !parsed.error
    && parsed.statements.length > 1
    && parsed.statements.every(isReadOnlyStatement);

  if (!canSplit) {
    return [{ id: 'example-0', label: fallbackLabel, sql: sourceSql.trim() }];
  }

  return parsed.statements.map((statement, index) => ({
    id: `example-${index}`,
    label: leadingCommentLabel(statement) || `${fallbackLabel} · example ${index + 1}`,
    sql: withSemicolon(statement),
  }));
}

export function createSqlWorkspaceState(examples: SqlExample[]): SqlWorkspaceState {
  const firstExample = examples[0];
  return {
    selectedOption: firstExample?.id ?? CUSTOM_SQL_OPTION,
    sql: firstExample?.sql ?? CUSTOM_SQL_TEMPLATE,
    customSql: CUSTOM_SQL_TEMPLATE,
  };
}

export function selectSqlOption(state: SqlWorkspaceState, examples: SqlExample[], optionId: string): SqlWorkspaceState {
  if (optionId === CUSTOM_SQL_OPTION) {
    return { ...state, selectedOption: CUSTOM_SQL_OPTION, sql: state.customSql };
  }

  const example = examples.find((candidate) => candidate.id === optionId) ?? examples[0];
  if (!example) return createSqlWorkspaceState(examples);
  return { ...state, selectedOption: example.id, sql: example.sql };
}

export function editSqlWorkspace(state: SqlWorkspaceState, sql: string): SqlWorkspaceState {
  return { ...state, selectedOption: CUSTOM_SQL_OPTION, sql, customSql: sql };
}

function conciseDuckDbDetail(message: string) {
  return message
    .replace(/^(Parser|Binder|Catalog|Conversion|Constraint) Error:\s*/i, '')
    .replace(/\s+LINE \d+:[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function friendlySqlError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || 'Unknown SQL error');
  const detail = conciseDuckDbDetail(raw);

  if (/took longer than/i.test(raw)) return raw;
  if (/Parser Error/i.test(raw)) {
    return `The query engine is a tough critic! It could not understand that SQL. Check commas, quotes, parentheses, and clause order.${detail ? ` Details: ${detail}` : ''}`;
  }
  if (/Binder Error|Catalog Error/i.test(raw)) {
    return `A table, column, or function could not be found in the Northstar database.${detail ? ` Details: ${detail}` : ''}`;
  }
  if (/Constraint Error|Conversion Error/i.test(raw)) {
    return `The SQL is valid, but one value does not fit the Northstar data rules.${detail ? ` Details: ${detail}` : ''}`;
  }
  return `DuckDB could not run that SQL.${detail ? ` Details: ${detail}` : ''}`;
}
