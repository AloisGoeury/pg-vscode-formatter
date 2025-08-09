
import fs from 'fs';
import path from 'path';
import url from 'url';
import { parse } from 'libpg-query';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const TESTS = path.join(ROOT, 'tests', 'cases');

const { formatSql } = await import(path.join(DIST, 'formatter.js'));

const update = !!process.env.UPDATE_GOLDENS;
let failures = 0;
let total = 0;

function diffLines(a, b) {
  const al = a.split(/\r?\n/);
  const bl = b.split(/\r?\n/);
  const max = Math.max(al.length, bl.length);
  const lines = [];
  for (let i = 0; i < max; i++) {
    const left = (al[i] ?? '');
    const right = (bl[i] ?? '');
    if (left !== right) {
      lines.push(`- ${left}`);
      lines.push(`+ ${right}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

function listCases() {
  return fs.readdirSync(TESTS).filter(d => fs.statSync(path.join(TESTS, d)).isDirectory());
}

async function runCase(name) {
  const dir = path.join(TESTS, name);
  const input = fs.readFileSync(path.join(dir, 'input.sql'), 'utf8');
  const expected = fs.readFileSync(path.join(dir, 'output.sql'), 'utf8');

  const cfg = {
    indentSize: 2,
    keywords: 'upper',
    commaPosition: 'end',
    lineWidth: 100,
    preserveComments: 'all'
  };

  const out = await formatSql(input, cfg);

  try { await parse(out); } catch (e) {
    console.error(`✖ [${name}] output does not parse:`, e.message);
    failures++; return;
  }

  const out2 = await formatSql(out, cfg);
  if (out2 !== out) {
    console.error(`✖ [${name}] not idempotent after second pass`);
    failures++; return;
  }

  if (out !== expected) {
    if (update) {
      fs.writeFileSync(path.join(dir, 'output.sql'), out);
      console.log(`↺ [${name}] golden updated.`);
    } else {
      console.error(`✖ [${name}] does not match golden.`);
      console.error(diffLines(expected, out));
      failures++; return;
    }
  } else {
    console.log(`✔ [${name}]`);
  }
}

for (const c of listCases()) {
  total++;
  await runCase(c);
}

if (failures > 0) {
  console.error(`\n${failures}/${total} failing.`);
  process.exit(1);
} else {
  console.log(`\nAll ${total} cases passed.`);
}
