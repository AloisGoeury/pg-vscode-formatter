
# PG Formatter + Linter (libpg_query)

A VS Code formatter + linter for PostgreSQL SQL & PL/pgSQL, backed by the real Postgres parser via WebAssembly (libpg_query).

![CI](https://github.com/AloisGoeury/pg-vscode-formatter/actions/workflows/ci.yml/badge.svg)

## Quickstart

```bash
npm i
npm run watch
# Press F5 in VS Code to launch the Extension Development Host
```

Enable format-on-save:

```jsonc
// settings.json
{
  "editor.formatOnSave": true,
  "[sql]": { "editor.defaultFormatter": "you.pg-vscode-formatter" },
  "[plpgsql]": { "editor.defaultFormatter": "you.pg-vscode-formatter" }
}
```
