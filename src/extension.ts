
import * as vscode from 'vscode';
import { formatSql } from './formatter';
import { runLint } from './linter';
import { initLibpgSync } from './libpg';

export async function activate(context: vscode.ExtensionContext) {
  try { await initLibpgSync(); } catch {}

  const languages = ['sql','plpgsql'];

  for (const lang of languages) {
    context.subscriptions.push(
      vscode.languages.registerDocumentFormattingEditProvider(lang, {
        provideDocumentFormattingEdits: async (doc) => {
          const cfg = vscode.workspace.getConfiguration('pgFormatter');
          const full = new vscode.Range(0,0, doc.lineCount, 0);
          const formatted = await formatSql(doc.getText(), {
            indentSize: cfg.get('indentSize', 2),
            keywords: cfg.get('keywords', 'upper') as any,
            commaPosition: cfg.get('commaPosition', 'end') as any,
            lineWidth: cfg.get('lineWidth', 100),
            preserveComments: cfg.get('preserveComments', 'all') as any
          });
          return [vscode.TextEdit.replace(full, formatted)];
        }
      })
    );
  }

  const collection = vscode.languages.createDiagnosticCollection('pg-linter');
  context.subscriptions.push(collection);

  const runDiagnostics = (doc?: vscode.TextDocument) => {
    if (!doc || !['sql','plpgsql'].includes(doc.languageId)) return;
    const cfg = vscode.workspace.getConfiguration();
    const diags = runLint(doc, cfg);
    collection.set(doc.uri, diags);
  };

  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(runDiagnostics));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => runDiagnostics(e.document)));
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(runDiagnostics));

  if (vscode.window.activeTextEditor) {
    runDiagnostics(vscode.window.activeTextEditor.document);
  }
}

export function deactivate() {}
