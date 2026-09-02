export type SqlPolicyResult =
  | { allowed: true }
  | {
      allowed: false;
      keyword: string;
      statementIndex: number;
      message: string;
    };

/**
 * Commands that can erase data, change the seeded schema, or reach outside
 * the in-memory lab. CREATE, INSERT, and UPDATE remain available because each
 * learner run gets a fresh database and those commands are useful for
 * experiments.
 */
const BLOCKED_KEYWORDS = [
  'DELETE',
  'DROP',
  'TRUNCATE',
  'ALTER',
  'ATTACH',
  'DETACH',
  'COPY',
  'EXPORT',
  'IMPORT',
  'INSTALL',
  'LOAD',
  'VACUUM',
  'BEGIN',
  'COMMIT',
  'ROLLBACK',
  'SAVEPOINT',
  'RELEASE',
] as const;

/**
 * Chapter-specific maintenance is deliberately exact. Chapter 14 rebuilds
 * its pre-aggregated table, so only that table's idempotent cleanup step is
 * allowed. The exception does not make arbitrary DROP statements available.
 */
const ALLOWED_MAINTENANCE = new Map<number, ReadonlySet<string>>([
  [14, new Set(['DROP TABLE IF EXISTS MONTHLY_REGION_CATEGORY'])],
]);

function wordsOutsideLiterals(sql: string) {
  const words: string[] = [];
  let word = '';
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;

  const flush = () => {
    if (word) words.push(word.toUpperCase());
    word = '';
  };

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        index += 1;
        blockComment = false;
      }
      continue;
    }
    if (quote) {
      if (character === quote) {
        if (next === quote) index += 1;
        else quote = null;
      }
      continue;
    }
    if (character === '-' && next === '-') {
      flush();
      index += 1;
      lineComment = true;
      continue;
    }
    if (character === '/' && next === '*') {
      flush();
      index += 1;
      blockComment = true;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      flush();
      quote = character;
      continue;
    }
    if (/[A-Za-z0-9_]/.test(character)) word += character;
    else flush();
  }
  flush();
  return words;
}

function normalizeStatement(sql: string) {
  const characters: string[] = [];
  let quote: string | null = null;
  let lineComment = false;
  let blockComment = false;
  let pendingSpace = false;

  const append = (character: string) => {
    if (pendingSpace && characters.length > 0) characters.push(' ');
    pendingSpace = false;
    characters.push(character);
  };

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const next = sql[index + 1];

    if (lineComment) {
      if (character === '\n') {
        lineComment = false;
        pendingSpace = true;
      }
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        index += 1;
        blockComment = false;
        pendingSpace = true;
      }
      continue;
    }
    if (quote) {
      append(character);
      if (character === quote) {
        if (next === quote) {
          append(next);
          index += 1;
        } else quote = null;
      }
      continue;
    }
    if (character === '-' && next === '-') {
      index += 1;
      lineComment = true;
      pendingSpace = true;
      continue;
    }
    if (character === '/' && next === '*') {
      index += 1;
      blockComment = true;
      pendingSpace = true;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      append(character);
      quote = character;
      continue;
    }
    if (/\s/.test(character)) {
      pendingSpace = true;
      continue;
    }
    append(character);
  }

  return characters.join('').trim().replace(/;+$/, '').trim().toUpperCase();
}

export function validateLearnerSql(statements: string[], chapterNumber: number): SqlPolicyResult {
  const allowedMaintenance = ALLOWED_MAINTENANCE.get(chapterNumber);

  for (const [statementIndex, statement] of statements.entries()) {
    const words = wordsOutsideLiterals(statement);
    const keyword = BLOCKED_KEYWORDS.find((candidate) => words.includes(candidate));
    if (!keyword) continue;

    if (keyword === 'DROP' && allowedMaintenance?.has(normalizeStatement(statement))) continue;

    const context = keyword === 'DROP' && chapterNumber === 14
      ? 'Only the allowlisted monthly_region_category rebuild step is permitted in this chapter.'
      : ['DELETE', 'DROP', 'TRUNCATE', 'ALTER'].includes(keyword)
        ? 'This chapter does not require destructive data or schema changes.'
        : ['BEGIN', 'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'RELEASE'].includes(keyword)
          ? 'Transaction control is managed by the browser lab so validation can be rolled back safely.'
        : 'External I/O and extension-loading commands are disabled in the browser lab.';
    return {
      allowed: false,
      keyword,
      statementIndex,
      message: `${keyword} statements are blocked in the browser lab. ${context}`,
    };
  }

  return { allowed: true };
}
