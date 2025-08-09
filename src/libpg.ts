
import { parse, parseSync, loadModule } from 'libpg-query';

export async function parseAsync(sql: string) {
  return await parse(sql);
}

export async function initLibpgSync() {
  await loadModule();
}

export function parseNow(sql: string) {
  return parseSync(sql);
}
