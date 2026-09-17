// A deliberately small syntax highlighter for the `code` node — NOT a real parser, just enough
// to make a method chain / call expression read as IDE-colored source. It scans left→right and
// classifies each run; the `code` branch of SceneNode paints each token in its class color
// (see scene.css .tok-*). General enough for Python / Scala / SQL-ish one-liners across concepts.

export type TokClass = 'var' | 'method' | 'keyword' | 'string' | 'number' | 'punct' | 'ws' | 'comment'
export interface CodeTok { cls: TokClass; text: string }

// A tiny keyword set (Python / Scala / SQL surface); an identifier NOT after a `.` and in this
// set paints as a keyword. Kept small on purpose — unknown identifiers fall back to `var`.
const KEYWORDS = new Set([
  'import', 'from', 'def', 'return', 'lambda', 'class', 'val', 'var', 'new', 'if', 'else', 'for',
  'in', 'as', 'and', 'or', 'not', 'null', 'true', 'false', 'is',
  // SQL clauses + common verbs (so a multi-line query reads as coloured source)
  'select', 'where', 'group', 'by', 'join', 'inner', 'left', 'right', 'full', 'outer', 'cross',
  'on', 'using', 'having', 'order', 'asc', 'desc', 'limit', 'offset', 'distinct', 'with', 'recursive',
  'union', 'intersect', 'except', 'all', 'insert', 'into', 'values', 'update', 'set', 'delete',
  'over', 'partition', 'between', 'like', 'exists', 'case', 'when', 'then', 'end', 'count', 'sum', 'avg', 'min', 'max',
])

const isIdentStart = (c: string) => /[A-Za-z_]/.test(c)
const isIdentPart = (c: string) => /[A-Za-z0-9_]/.test(c)
const isDigit = (c: string) => /[0-9]/.test(c)

/** Tokenize a single line of source into classified runs. Identifier-after-`.` = method,
 *  a keyword = keyword, otherwise a variable; strings, numbers, and punctuation as themselves. */
export function tokenizeCode(src: string): CodeTok[] {
  const out: CodeTok[] = []
  let i = 0
  // Whether the previous NON-whitespace token was a `.` — makes `foo.bar` colour `bar` as a method.
  let afterDot = false
  const push = (cls: TokClass, text: string) => {
    out.push({ cls, text })
    if (cls !== 'ws') afterDot = cls === 'punct' && text === '.'
  }

  while (i < src.length) {
    const c = src[i]

    // whitespace
    if (/\s/.test(c)) {
      let j = i + 1
      while (j < src.length && /\s/.test(src[j])) j++
      push('ws', src.slice(i, j))
      i = j
      continue
    }

    // line comment: `-- …` (SQL) or `# …` (Python/shell) → rest of the line is a comment.
    // tokenizeCode runs per line, so consuming to end-of-string is end-of-line.
    if ((c === '-' && src[i + 1] === '-') || c === '#') {
      push('comment', src.slice(i))
      break
    }

    // string literal ('…' or "…")
    if (c === "'" || c === '"') {
      let j = i + 1
      while (j < src.length && src[j] !== c) j++
      j = Math.min(j + 1, src.length) // include the closing quote if present
      push('string', src.slice(i, j))
      i = j
      continue
    }

    // number
    if (isDigit(c)) {
      let j = i + 1
      while (j < src.length && (isDigit(src[j]) || src[j] === '.')) j++
      push('number', src.slice(i, j))
      i = j
      continue
    }

    // identifier
    if (isIdentStart(c)) {
      let j = i + 1
      while (j < src.length && isIdentPart(src[j])) j++
      const word = src.slice(i, j)
      const cls: TokClass = afterDot ? 'method' : KEYWORDS.has(word.toLowerCase()) ? 'keyword' : 'var'
      push(cls, word)
      i = j
      continue
    }

    // ellipsis (real … glyph or three dots) → punctuation
    if (c === '…') {
      push('punct', c)
      i += 1
      continue
    }
    if (c === '.' && src.slice(i, i + 3) === '...') {
      push('punct', '...')
      i += 3
      continue
    }

    // any other single punctuation char
    push('punct', c)
    i += 1
  }
  return out
}
