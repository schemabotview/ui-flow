export type TokClass = 'var' | 'method' | 'keyword' | 'string' | 'number' | 'punct' | 'ws' | 'comment'
export interface CodeTok { cls: TokClass; text: string }

const KEYWORDS = new Set([
  'import', 'from', 'def', 'return', 'lambda', 'class', 'val', 'var', 'new', 'if', 'else', 'for',
  'in', 'as', 'and', 'or', 'not', 'null', 'true', 'false', 'is',
  'select', 'where', 'group', 'by', 'join', 'inner', 'left', 'right', 'full', 'outer', 'cross',
  'on', 'using', 'having', 'order', 'asc', 'desc', 'limit', 'offset', 'distinct', 'with', 'recursive',
  'union', 'intersect', 'except', 'all', 'insert', 'into', 'values', 'update', 'set', 'delete',
  'over', 'partition', 'between', 'like', 'exists', 'case', 'when', 'then', 'end', 'count', 'sum', 'avg', 'min', 'max',
])

const TOKEN = /(\s+)|((?:--|#)[\s\S]*)|('[^']*'?|"[^"]*"?)|(\d[\d.]*)|([A-Za-z_]\w*)|(\.\.\.|[\s\S])/g

export function tokenizeCode(src: string): CodeTok[] {
  const out: CodeTok[] = []
  let afterDot = false
  for (const [text, ws, comment, str, num, word] of src.matchAll(TOKEN)) {
    const cls: TokClass = ws ? 'ws' : comment ? 'comment' : str ? 'string' : num ? 'number'
      : word ? (afterDot ? 'method' : KEYWORDS.has(word.toLowerCase()) ? 'keyword' : 'var') : 'punct'
    out.push({ cls, text })
    if (cls !== 'ws') afterDot = cls === 'punct' && text === '.'
  }
  return out
}
