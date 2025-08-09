import { parseAsync } from './libpg';

type Options = {
  indentSize: number;
  keywords: 'upper' | 'lower' | 'preserve';
  commaPosition: 'end' | 'leading';
  lineWidth: number;
  preserveComments: 'all' | 'line' | 'block' | 'none';
};

export async function formatSql(src: string, opts: Options): Promise<string> {
  try { await parseAsync(src); } catch { return src; }

  const out = applySelectListLeadingComma(src, 4, 4, { keywords: opts.keywords });
  return out;
}

function applySelectListLeadingComma(sql: string, threshold: number, firstIndent: number, opts?: { keywords: 'upper' | 'lower' | 'preserve' }) {
  const re = /\bselect\b([\s\S]*?)\bfrom\b/gi;
  return sql.replace(re, (m, listPartRaw) => {
    const listPart = listPartRaw.trim();
    const fields = splitTopLevel(listPart, ',');
    if (fields.length <= threshold) return m;

    const indent = ' '.repeat(firstIndent);

    const fmt = (t: string) => normalizeTarget(t, opts?.keywords ?? 'upper');

    const first = indent + fmt(fields[0]);
    const rest = fields.slice(1).map(f => indent + ', ' + fmt(f));

    return 'SELECT\n' + [first, ...rest].join('\n') + '\nFROM';
  });
}

function normalizeTarget(s: string, keywordCase: 'upper' | 'lower' | 'preserve'): string {
  let t = s.trim();

  t = t.replace(/\s*,\s*/g, ', ');

  t = t.replace(/\bas\b/gi, (m) => {
    if (keywordCase === 'upper') return 'AS';
    if (keywordCase === 'lower') return 'as';
    return m;
  });

  return t.replace(/\s+/g, ' ');
}

function clean(s: string) {
  return s.trim().replace(/\s+/g, ' ');
}

function splitTopLevel(input: string, sepChar: string): string[] {
  const parts: string[] = [];
  let level = 0, cur = '';
  const dollar = /\$\$|\$[a-zA-Z_][\w]*\$/g;
  for (let i = 0; i < input.length; i++) {
    dollar.lastIndex = i;
    const dq = dollar.exec(input);
    if (dq && dq.index === i) {
      const tag = dq[0];
      const end = tag === '$$' ? /\$\$/g : new RegExp(tag.replace(/\$/g, '\\$'), 'g');
      end.lastIndex = dollar.lastIndex;
      const endMatch = end.exec(input);
      const stop = endMatch ? endMatch.index + endMatch[0].length : input.length;
      cur += input.slice(i, stop);
      i = stop - 1; continue;
    }
    const ch = input[i];
    if (ch === '(') { level++; cur += ch; continue; }
    if (ch === ')') { level = Math.max(0, level - 1); cur += ch; continue; }
    if (ch === sepChar && level === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur) parts.push(cur);
  return parts.map(s => s.trim()).filter(Boolean);
}
