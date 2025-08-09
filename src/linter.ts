
import * as vscode from 'vscode';

export function runLint(doc: vscode.TextDocument, cfg: vscode.WorkspaceConfiguration): vscode.Diagnostic[] {
  const text = doc.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  const paramPrefix = cfg.get<string>('pgLinter.paramPrefix', 'p');
  const declPrefix  = cfg.get<string>('pgLinter.declarePrefix', 'v');
  const disallowCTE = cfg.get<string>('pgLinter.disallowFirstCTEName', 'source');

  const funcRegex = /create\s+(or\s+replace\s+)?function\s+[\w\."$]+\s*\(([^)]*)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = funcRegex.exec(text)) !== null) {
    const params = m[2];
    const paramList = params.split(/,(?![^\(\)]*\))/).map(s => s.trim()).filter(Boolean);
    for (const p of paramList) {
      const nameMatch = /\b(out|in|inout|variadic)\b\s+([a-zA-Z_][\w$]*)|^\s*([a-zA-Z_][\w$]*)/i.exec(p);
      const name = (nameMatch && (nameMatch[2] || nameMatch[3])) || null;
      if (name && !new RegExp('^' + escapeRegExp(paramPrefix)).test(name)) {
        const idx = m.index + m[0].indexOf(p) + (nameMatch?.index ?? 0);
        diagnostics.push(makeDiag(doc, idx, name.length, `Paramètre "${name}" doit commencer par "${paramPrefix}..."`));
      }
    }
  }

  const declareRegex = /\bdeclare\b([\s\S]*?)\bbegin\b/gi;
  while ((m = declareRegex.exec(text)) !== null) {
    const block = m[1];
    const lines = block.split(/\r?\n/);
    for (const line of lines) {
      const l = line.replace(/--.*$/, '').trim();
      if (!l) continue;
      const nm = /^([a-zA-Z_][\w$]*)\b/.exec(l);
      if (nm) {
        const name = nm[1];
        if (!new RegExp('^' + escapeRegExp(declPrefix)).test(name)) {
          const idx = m.index + 1 + (text.slice(m.index, m.index + m[0].length).indexOf(line));
          diagnostics.push(makeDiag(doc, idx, name.length, `Variable "${name}" doit commencer par "${declPrefix}..."`));
        }
      }
    }
  }

  if (disallowCTE) {
    const withMatch = /\bwith\s+([a-zA-Z_][\w$]*)\s+as\b/i.exec(text);
    if (withMatch && withMatch[1].toLowerCase() === disallowCTE.toLowerCase()) {
      const idx = withMatch.index + withMatch[0].toLowerCase().indexOf(withMatch[1].toLowerCase());
      diagnostics.push(makeDiag(doc, idx, withMatch[1].length, `CTE "${withMatch[1]}" déconseillée, choisis un nom plus précis.`));
    }
  }

  return diagnostics;
}

function makeDiag(doc: vscode.TextDocument, startOffset: number, length: number, message: string): vscode.Diagnostic {
  const start = doc.positionAt(startOffset);
  const end   = doc.positionAt(startOffset + Math.max(1, length));
  const diag = new vscode.Diagnostic(new vscode.Range(start, end), message, vscode.DiagnosticSeverity.Warning);
  diag.source = 'pg-linter';
  return diag;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
