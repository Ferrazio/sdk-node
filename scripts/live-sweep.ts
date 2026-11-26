/**
 * Live sweep: calls every operation of the snapshot through the SDK against a
 * running gateway and reports, per operation, what came back.
 *
 *   FERRAZIO_BASE_URL=https://gateway.of.a.test.environment FERRAZIO_API_KEY=fz_... bun scripts/live-sweep.ts [report.json]
 *
 * It is built to cause no effect on the data:
 * - `GET` runs for real, with ids taken from the lists it has just read, and
 *   the answer is checked against the schema the document declares;
 * - a write that has a path parameter runs with an id that does not exist;
 * - a write without one runs with an empty body, and only when the body has a
 *   required field, so the gateway refuses it before any handler;
 * - a write that fits neither case is not called and is listed as skipped.
 *
 * Never point it at production.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ferrazio, FerrazioApiError } from '../src/index.js';

type Json = Record<string, any>;

interface Entry {
  method: string;
  path: string;
  namespace: string[];
  name: string;
}

interface Result {
  route: string;
  sdk: string;
  kind: 'read' | 'write-fake-id' | 'write-empty-body' | 'skipped';
  outcome: string;
  status?: number;
  detail?: string;
  realIds?: boolean;
  mismatches?: string[];
}

const ROOT = join(import.meta.dir, '..');
const spec: Json = JSON.parse(readFileSync(join(ROOT, 'openapi/openapi.json'), 'utf8'));
const manifest: Entry[] = JSON.parse(readFileSync(join(ROOT, 'openapi/operations.json'), 'utf8'));
const byRoute = new Map(manifest.map((entry) => [`${entry.method} ${entry.path}`, entry]));
const REPORT = process.argv[2] ?? 'live-sweep.json';
const FAKE_ID = '999999999999999999';
const CONCURRENCY = 4;

const fz = new Ferrazio({ timeout: 25_000, maxRetries: 2 });
if (/gate\.ferrazio\.com/.test(fz.baseUrl)) throw new Error('Refusing to sweep production.');

const me = (await fz.auth.me()) as Json;
const organizationId = String(me.organization_id);

// ---------------------------------------------------------------- schema check

function resolve(schema: Json | undefined): Json | undefined {
  let current = schema;
  for (let depth = 0; current?.$ref && depth < 10; depth++) current = spec.components.schemas[current.$ref.split('/').pop()];
  return current;
}

/** Differences between a value and its declared schema. Extra fields are not differences. */
function validate(value: unknown, schema: Json | undefined, at: string, out: string[], depth = 0): void {
  const resolved = resolve(schema);
  if (!resolved || out.length >= 6 || depth > 12) return;
  const variants: Json[] | undefined = resolved.oneOf ?? resolved.anyOf;
  if (variants) {
    const attempts = variants.map((variant) => {
      const errors: string[] = [];
      validate(value, variant, at, errors, depth + 1);
      return errors;
    });
    if (!attempts.some((errors) => errors.length === 0)) out.push(`${at}: matches no variant (${attempts[0]?.[0] ?? ''})`);
    return;
  }
  for (const part of resolved.allOf ?? []) validate(value, part, at, out, depth + 1);
  if (resolved.enum && !resolved.enum.includes(value)) {
    out.push(`${at}: ${JSON.stringify(value)} is not in the enum`);
    return;
  }
  const types: string[] = [resolved.type].flat().filter(Boolean);
  if (types.length === 0 && !resolved.properties) return;
  if (value === null) {
    if (!types.includes('null')) out.push(`${at}: null where ${types.join('|') || 'object'} is declared`);
    return;
  }
  const actual = Array.isArray(value) ? 'array' : typeof value;
  const accepts = (type: string) =>
    type === actual ||
    (type === 'integer' && actual === 'number' && Number.isInteger(value)) ||
    (type === 'integer' && actual === 'string' && /^-?\d+$/.test(value as string) && resolved.format === 'int64') ||
    (type === 'number' && actual === 'number');
  const declared = types.length > 0 ? types : ['object'];
  if (!declared.some(accepts)) {
    out.push(`${at}: ${actual} where ${declared.join('|')} is declared`);
    return;
  }
  if (actual === 'array') {
    (value as unknown[]).slice(0, 3).forEach((item, index) => validate(item, resolved.items, `${at}[${index}]`, out, depth + 1));
  } else if (actual === 'object') {
    const record = value as Json;
    for (const name of resolved.required ?? []) if (!(name in record)) out.push(`${at}.${name}: required field missing`);
    for (const [name, property] of Object.entries<Json>(resolved.properties ?? {})) {
      if (name in record) validate(record[name], property, `${at}.${name}`, out, depth + 1);
    }
  }
}

// ------------------------------------------------------------------ id harvest

/** Lists already read, by concrete path. */
const lists = new Map<string, Json[]>();
/** Values seen for a field name anywhere, e.g. `person_id`. */
const pool = new Map<string, string>();

function harvest(concretePath: string, value: unknown): void {
  const walk = (node: unknown, depth: number) => {
    if (depth > 4 || node === null || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.slice(0, 3).forEach((item) => walk(item, depth + 1));
    for (const [name, field] of Object.entries(node as Json)) {
      if ((typeof field === 'string' || typeof field === 'number') && /(^|_)id$/.test(name) && String(field) !== '' && !pool.has(name)) {
        pool.set(name, String(field));
      }
      walk(field, depth + 1);
    }
  };
  walk(value, 0);
  if (value && typeof value === 'object') {
    const arrays = Array.isArray(value) ? [value] : Object.values(value as Json).filter(Array.isArray);
    const items = (arrays.find((array) => array.length > 0 && typeof array[0] === 'object') ?? []) as Json[];
    if (items.length > 0) lists.set(concretePath, items);
  }
}

function singular(word: string): string {
  return word.replace(/ies$/, 'y').replace(/(ss|x|ch|sh)es$/, '$1').replace(/([^su])s$/, '$1');
}

/** A real value for one path parameter, or `undefined` when none was seen. */
function realValue(param: string, concreteParent: string): string | undefined {
  const item = lists.get(concreteParent)?.[0];
  const noun = singular(concreteParent.split('/').pop() ?? '').replace(/-/g, '_');
  for (const name of [param, 'id', `${noun}_id`]) {
    const value = item?.[name];
    if ((typeof value === 'string' || typeof value === 'number') && String(value) !== '') return String(value);
  }
  return param === 'id' ? undefined : pool.get(param);
}

// ------------------------------------------------------------------- arguments

/** Values a handler checks by format, so the call gets past validation. */
const HINTS: Record<string, unknown> = {
  environment: 'HOMOLOGATION',
  target: 'payable',
  anexo: 'I',
  document: '11222333000181',
  cnpj: '11222333000181',
  emitter_cnpj: '11222333000181',
  readjust_index: 'ipca',
  index: 'ipca',
  uf: 'SP',
};

function sample(name: string, schema: Json | undefined): unknown {
  const resolved = resolve(schema) ?? {};
  if (name === 'organization_id') return organizationId;
  if (name in HINTS) return HINTS[name];
  if (resolved.enum) return resolved.enum[0];
  const type = [resolved.type].flat().find((candidate) => candidate && candidate !== 'null');
  if (type === 'array') return [sample(name, resolved.items)];
  if (type === 'integer' || type === 'number') return /year/.test(name) ? 2026 : 1;
  if (type === 'boolean') return false;
  if (resolved.format === 'date-time') return '2026-10-01T00:00:00Z';
  if (resolved.format === 'date' || /(^|_)(date|from|to|start|end|since|until|day)$/.test(name)) return '2026-10-01';
  if (/month|period|competence/.test(name)) return '2026-10';
  if (/(^|_)id$/.test(name)) return pool.get(name) ?? FAKE_ID;
  if (name === 'currency') return 'BRL';
  return 'a';
}

function operationsOf(): Array<{ path: string; verb: string; operation: Json; entry: Entry }> {
  const out = [];
  for (const [path, item] of Object.entries<Json>(spec.paths)) {
    for (const verb of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = item[verb];
      const entry = byRoute.get(`${verb.toUpperCase()} ${path}`);
      if (operation && entry) out.push({ path, verb, operation, entry });
    }
  }
  return out;
}

function emptyBody(operation: Json): { has: boolean; value?: unknown; required: boolean } {
  const content: Json | undefined = operation.requestBody?.content;
  if (!content) return { has: false, required: false };
  if (content['application/json']) {
    const required = (resolve(content['application/json'].schema)?.required ?? []).length > 0;
    return { has: true, value: {}, required };
  }
  if (content['multipart/form-data']) return { has: true, value: new FormData(), required: false };
  if (content['application/x-www-form-urlencoded']) return { has: true, value: {}, required: false };
  return { has: true, value: new Uint8Array(0), required: false };
}

async function call(item: ReturnType<typeof operationsOf>[number], kind: Result['kind']): Promise<Result> {
  const { path, verb, operation, entry } = item;
  const route = `${verb.toUpperCase()} ${path}`;
  const sdk = `fz.${entry.namespace.join('.')}.${entry.name}`;
  const names = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]!);
  // A parameter the document calls `path` but the route does not hold travels in the query.
  const params: Json[] = (operation.parameters ?? []).map((param: Json) => {
    if (param.in !== 'path' || names.includes(param.name)) return param;
    const nullable = [resolve(param.schema)?.type].flat().includes('null') || Boolean(resolve(param.schema)?.oneOf);
    return { ...param, in: 'query', required: !nullable && !/^(page_size|page_token)$/.test(param.name) && resolve(param.schema)?.type === 'string' };
  });

  let concrete = path;
  let realIds = names.length > 0;
  const pathValues: string[] = [];
  for (const name of names) {
    const parent = concrete.slice(0, concrete.indexOf(`{${name}}`)).replace(/\/$/, '');
    const real = kind === 'read' ? realValue(name, parent) : undefined;
    if (!real) realIds = false;
    const fallback = kind === 'read' && name in HINTS ? String(HINTS[name]) : kind === 'read' && /postal-code/.test(path) ? '01001000' : FAKE_ID;
    pathValues.push(real ?? fallback);
    concrete = concrete.replace(`{${name}}`, real ?? fallback);
  }

  const queryParams = params.filter((param) => param.in === 'query');
  const query: Json = {};
  for (const param of queryParams) {
    if (param.required) query[param.name] = sample(param.name, param.schema);
    else if (param.name === 'page_size' || param.name === 'limit') query[param.name] = 2;
  }
  const headers = Object.fromEntries(params.filter((param) => param.in === 'header').map((param) => [param.name, 'sdk-sweep']));
  const body = emptyBody(operation);
  const args = [...pathValues, ...(body.has ? [body.value] : []), ...(queryParams.length > 0 ? [query] : []), { headers }];

  let target: any = fz;
  for (const segment of entry.namespace) target = target[segment];
  const result: Result = { route, sdk, kind, outcome: '', realIds: names.length > 0 ? realIds : undefined };
  try {
    const value = await target[entry.name](...args);
    const success = Object.entries<Json>(operation.responses ?? {}).find(([status]) => status.startsWith('2'));
    result.status = Number(success?.[0] ?? 200);
    if (value instanceof Response) {
      result.status = value.status;
      result.outcome = 'ok-file';
      result.detail = value.headers.get('content-type') ?? undefined;
      await value.body?.cancel().catch(() => undefined);
    } else if (typeof value === 'string') {
      result.outcome = 'ok-text';
      result.detail = `${value.length} chars`;
    } else {
      if (kind === 'read') harvest(concrete, value);
      const schema = Object.values<Json>(success?.[1]?.content ?? {})[0]?.schema;
      if (!schema) result.outcome = value === undefined ? 'ok-empty' : 'ok-undescribed';
      else {
        const mismatches: string[] = [];
        validate(value, schema, '$', mismatches);
        result.outcome = mismatches.length === 0 ? 'ok' : 'ok-schema-mismatch';
        if (mismatches.length > 0) result.mismatches = mismatches;
      }
    }
    if (kind !== 'read') result.outcome = `EFFECT-${result.outcome}`;
  } catch (error) {
    if (error instanceof FerrazioApiError) {
      result.status = error.status;
      result.outcome = error.body === undefined ? `http-${error.status}-empty` : `http-${error.status}`;
      result.detail = `${error.error}/${error.code}: ${error.message.split(': ').slice(1).join(': ')}`.slice(0, 200);
    } else {
      result.outcome = 'sdk-exception';
      result.detail = String((error as Error)?.stack ?? error).slice(0, 400);
    }
  }
  return result;
}

async function runAll<T>(items: T[], worker: (item: T) => Promise<Result>, sink: Result[]): Promise<void> {
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const item = items[next++]!;
        sink.push(await worker(item));
      }
    }),
  );
}

// ------------------------------------------------------------------------ main

const all = operationsOf();
const results: Result[] = [];
const reads = all.filter((item) => item.verb === 'get');
const depth = (item: (typeof all)[number]) => (item.path.match(/\{/g) ?? []).length;
// Lists first, then one more path parameter per round, so each round finds the ids the previous one read.
for (const level of [...new Set(reads.map(depth))].sort((a, b) => a - b)) {
  const round = reads.filter((item) => depth(item) === level).sort((a, b) => a.path.length - b.path.length);
  await runAll(round, (item) => call(item, 'read'), results);
  console.error(`read, ${level} path parameter(s): ${round.length} done`);
}

const writes = process.env.SWEEP_ONLY === 'read' ? [] : all.filter((item) => item.verb !== 'get');
const fakeId = writes.filter((item) => depth(item) > 0);
const emptyBodied = writes.filter((item) => depth(item) === 0 && emptyBody(item.operation).required);
const skipped = writes.filter((item) => depth(item) === 0 && !emptyBody(item.operation).required);
await runAll(fakeId, (item) => call(item, 'write-fake-id'), results);
console.error(`write with a nonexistent id: ${fakeId.length} done`);
await runAll(emptyBodied, (item) => call(item, 'write-empty-body'), results);
console.error(`write with an empty body: ${emptyBodied.length} done`);
for (const item of skipped) {
  results.push({ route: `${item.verb.toUpperCase()} ${item.path}`, sdk: `fz.${item.entry.namespace.join('.')}.${item.entry.name}`, kind: 'skipped', outcome: 'skipped' });
}

results.sort((a, b) => a.route.localeCompare(b.route));
writeFileSync(REPORT, `${JSON.stringify(results, null, 1)}\n`);
const tally = new Map<string, number>();
for (const result of results) {
  const key = `${result.kind.padEnd(17)} ${result.outcome}`;
  tally.set(key, (tally.get(key) ?? 0) + 1);
}
for (const [key, count] of [...tally].sort()) console.log(String(count).padStart(5), key);
console.log(`${results.length} operations, report in ${REPORT}`);
