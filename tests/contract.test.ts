/**
 * Contract test: every operation of the OpenAPI snapshot is called through its
 * SDK method against a fake `fetch`, and the request that leaves the client is
 * compared with what the document demands. Expectations are derived from the
 * document itself; `operations.json` is used only to find the method.
 */
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ferrazio, Paginator, Resource } from '../src/index.js';

type Json = Record<string, any>;

interface Entry {
  method: string;
  path: string;
  namespace: string[];
  name: string;
  paginated: boolean;
}

const ROOT = join(import.meta.dir, '..');
const spec: Json = JSON.parse(readFileSync(join(ROOT, 'openapi/openapi.json'), 'utf8'));
const manifest: Entry[] = JSON.parse(readFileSync(join(ROOT, 'openapi/operations.json'), 'utf8'));
const byRoute = new Map(manifest.map((entry) => [`${entry.method} ${entry.path}`, entry]));
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

interface Captured {
  url: URL;
  init: RequestInit;
}

function resolve(schema: Json | undefined): Json | undefined {
  let current = schema;
  for (let depth = 0; current?.$ref && depth < 10; depth++) current = spec.components.schemas[current.$ref.split('/').pop()];
  return current;
}

/** The first 2xx response of the operation, as the server would send it. */
function successOf(operation: Json): { status: number; mime?: string; schema?: Json } {
  const all = Object.entries<Json>(operation.responses ?? {});
  const responses = all.filter(([status]) => status.startsWith('2'));
  const redirect = all.find(([status]) => status.startsWith('3'));
  if (responses.length === 0 && redirect) return { status: Number(redirect[0]) };
  const described = responses.find(([, response]) => response.content && Object.keys(response.content).length > 0);
  const [status, response] = described ?? responses[0] ?? ['200', {}];
  const mime = response.content ? Object.keys(response.content)[0] : undefined;
  return { status: Number(status), mime, schema: mime ? response.content[mime].schema : undefined };
}

/** Where a page keeps its items, read from the document alone. */
function itemsField(schema: Json | undefined): string {
  const properties: Json | undefined = resolve(schema)?.properties;
  if (!properties) return 'records';
  const arrays = Object.keys(properties).filter((name) => resolve(properties[name])?.type === 'array');
  if (arrays.includes('items')) return 'items';
  return arrays.length === 1 ? arrays[0]! : 'records';
}

function queryValue(schema: Json | undefined): unknown {
  const type = [resolve(schema)?.type].flat().find((candidate) => candidate && candidate !== 'null');
  if (type === 'array') return ['a b', 'c'];
  if (type === 'integer' || type === 'number') return 7;
  if (type === 'boolean') return true;
  return 'v x&y';
}

function method(fz: Ferrazio, entry: Entry, name: string): { target: any; fn: (...args: unknown[]) => any } {
  let target: any = fz;
  for (const segment of entry.namespace) target = target?.[segment];
  return { target, fn: target?.[name] };
}

async function check(path: string, verb: string, operation: Json): Promise<string[]> {
  const problems: string[] = [];
  const route = `${verb.toUpperCase()} ${path}`;
  const entry = byRoute.get(route);
  if (!entry) return ['no SDK method'];

  const captured: Captured[] = [];
  const success = successOf(operation);
  const field = itemsField(success.schema);
  // 202, 204 and 205 with nothing described promise an empty body.
  const empty = !success.mime && [202, 204, 205].includes(success.status);
  const isJson = !success.mime || /json/.test(success.mime);
  const replies: Array<() => Response> = [];
  const reply = (): Response => {
    if (empty && !entry.paginated) return new Response(null, { status: success.status });
    if (success.status >= 300) return new Response(null, { status: success.status, headers: { location: 'http://front.test/back' } });
    if (!isJson) return new Response('raw-body', { status: success.status, headers: { 'content-type': success.mime! } });
    return new Response(JSON.stringify({ [field]: [1, 2], next_page_token: '', marker: 'ok' }), {
      status: success.status === 204 ? 200 : success.status,
      headers: { 'content-type': 'application/json' },
    });
  };
  const fz = new Ferrazio({
    baseUrl: 'https://sdk.test',
    apiKey: 'fz_contract',
    organizationId: 'org-1',
    maxRetries: 0,
    fetch: async (input, init) => {
      captured.push({ url: new URL(input), init });
      return (replies.shift() ?? reply)();
    },
  });

  const pathNames = [...path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]!);
  // A parameter the document calls `path` but the route does not hold travels in the query.
  const params: Json[] = [...(spec.paths[path].parameters ?? []), ...(operation.parameters ?? [])].map((param: Json) =>
    param.in === 'path' && !pathNames.includes(param.name) ? { ...param, in: 'query' } : param,
  );
  const pathValues = pathNames.map((_, index) => `p${index}/x y`);
  const queryParams = params.filter((param) => param.in === 'query');
  const headerParams = params.filter((param) => param.in === 'header');
  const content: Json | undefined = operation.requestBody?.content;
  const bodyMime = content ? (content['application/json'] ? 'application/json' : Object.keys(content)[0]!) : undefined;

  const jsonBody = { probe: 1, nested: { ok: true }, text: 'acentuação', list: [1, 'two'] };
  const bytes = new Uint8Array([1, 2, 3, 0, 255]);
  const form = new FormData();
  form.set('field', 'value');
  const body =
    bodyMime === undefined
      ? undefined
      : bodyMime === 'application/json'
        ? jsonBody
        : bodyMime === 'multipart/form-data'
          ? form
          : bodyMime === 'application/x-www-form-urlencoded'
            ? { a: '1', b: 'x y' }
            : bytes;

  const buildArgs = (query: Json) => [
    ...pathValues,
    ...(bodyMime ? [body] : []),
    ...(queryParams.length > 0 ? [query] : []),
    { headers: Object.fromEntries(headerParams.map((param) => [param.name, `h-${param.name}`])) },
  ];
  const fullQuery = Object.fromEntries(queryParams.map((param) => [param.name, queryValue(param.schema)]));

  const { target, fn } = method(fz, entry, entry.name);
  if (typeof fn !== 'function') return [`fz.${entry.namespace.join('.')}.${entry.name} is not a function`];
  let result: unknown;
  try {
    result = await fn.apply(target, buildArgs(fullQuery));
  } catch (error) {
    return [`threw: ${String(error)}`];
  }

  const sent = captured[0];
  if (!sent) return ['no request left the client'];
  const headers = new Headers(sent.init.headers);
  const expectedPath = path.replace(/\{([^}]+)\}/g, (_, name: string) => encodeURIComponent(pathValues[pathNames.indexOf(name)]!));
  if (sent.init.method !== verb.toUpperCase()) problems.push(`method ${sent.init.method}`);
  if (sent.url.pathname !== expectedPath) problems.push(`path ${sent.url.pathname} != ${expectedPath}`);

  for (const param of queryParams) {
    const expected = [fullQuery[param.name]].flat().map(String);
    const got = sent.url.searchParams.getAll(param.name);
    if (JSON.stringify(got) !== JSON.stringify(expected)) problems.push(`query ${param.name}: ${JSON.stringify(got)}`);
  }
  const extra = [...new Set(sent.url.searchParams.keys())].filter((key) => !queryParams.some((param) => param.name === key));
  if (extra.length > 0) problems.push(`unexpected query ${extra.join(',')}`);

  const secured = (operation.security ?? spec.security ?? []).length > 0;
  const authorization = headers.get('authorization');
  if (secured && authorization !== 'ApiKey fz_contract') problems.push(`authorization ${authorization}`);
  if (!secured && authorization !== null) problems.push('credentials sent to a public route');
  if (headers.get('x-organization-id') !== 'org-1') problems.push('organization header missing');
  for (const param of headerParams) {
    if (headers.get(param.name) !== `h-${param.name}`) problems.push(`header ${param.name} missing`);
  }

  const contentType = headers.get('content-type');
  if (bodyMime === undefined) {
    if (sent.init.body !== undefined && sent.init.body !== null) problems.push('body sent to a route without one');
    if (contentType !== null) problems.push(`content-type ${contentType} without body`);
  } else if (bodyMime === 'application/json') {
    if (contentType !== 'application/json') problems.push(`content-type ${contentType}`);
    if (typeof sent.init.body !== 'string') problems.push('json body missing');
    else if (JSON.stringify(JSON.parse(sent.init.body)) !== JSON.stringify(jsonBody)) problems.push('json body altered');
  } else if (bodyMime === 'multipart/form-data') {
    if (!(sent.init.body instanceof FormData)) problems.push('multipart body is not FormData');
    if (contentType !== null) problems.push('content-type forced on multipart (the boundary would be lost)');
  } else if (bodyMime === 'application/x-www-form-urlencoded') {
    if (contentType !== bodyMime) problems.push(`content-type ${contentType}`);
    if (String(sent.init.body) !== 'a=1&b=x+y') problems.push(`form body ${String(sent.init.body)}`);
  } else {
    if (contentType !== 'application/octet-stream') problems.push(`content-type ${contentType}`);
    if (sent.init.body !== bytes) problems.push('binary body altered');
  }

  if (success.status >= 300) {
    if (!(result instanceof Response) || result.status !== success.status) problems.push('redirect not handed over');
    if (sent.init.redirect !== 'manual') problems.push('redirect would be followed');
  } else if (empty) {
    if (result !== undefined) problems.push(`${success.status} did not resolve to undefined`);
  } else if (isJson) {
    if ((result as Json | undefined)?.marker !== 'ok') problems.push(`json response not decoded: ${JSON.stringify(result)?.slice(0, 60)}`);
  } else if (/^text\/(plain|csv)|xml/.test(success.mime!)) {
    if (result !== 'raw-body') problems.push(`text response not decoded: ${String(result).slice(0, 40)}`);
  } else if (!(result instanceof Response) || (await result.text()) !== 'raw-body') {
    problems.push('binary response is not the untouched Response');
  }

  const all = method(fz, entry, `${entry.name}All`);
  if (entry.paginated !== (typeof all.fn === 'function')) problems.push(`paginated=${entry.paginated} but All is ${typeof all.fn}`);
  if (entry.paginated && typeof all.fn === 'function') {
    captured.length = 0;
    const page = (items: unknown[], next: string) => () =>
      new Response(JSON.stringify({ [field]: items, next_page_token: next }), { headers: { 'content-type': 'application/json' } });
    replies.push(page(['a', 'b'], 't2'), page(['c'], ''));
    const { page_token: _start, ...filters } = fullQuery;
    try {
      const paginator = all.fn.apply(all.target, buildArgs(filters));
      if (!(paginator instanceof Paginator)) problems.push('All did not return a Paginator');
      const items = await paginator.toArray();
      if (JSON.stringify(items) !== '["a","b","c"]') problems.push(`All yielded ${JSON.stringify(items)}`);
      if (captured.length !== 2) problems.push(`All made ${captured.length} requests`);
      if (captured[0]?.url.searchParams.has('page_token')) problems.push('first page sent a page_token');
      if (captured[1]?.url.searchParams.get('page_token') !== 't2') problems.push('second page did not send the cursor');
      for (const name of Object.keys(filters)) {
        if (!captured[1]?.url.searchParams.has(name)) problems.push(`second page dropped filter ${name}`);
      }
    } catch (error) {
      problems.push(`All threw: ${String(error)}`);
    }
  }
  return problems;
}

const operations: Array<{ path: string; verb: string; operation: Json }> = [];
for (const [path, item] of Object.entries<Json>(spec.paths)) {
  for (const verb of METHODS) if (item[verb]) operations.push({ path, verb, operation: item[verb] });
}

describe('contract with the OpenAPI snapshot', () => {
  test('the snapshot and the method index describe the same operations', () => {
    expect(operations.length).toBeGreaterThan(1000);
    expect(manifest.length).toBe(operations.length);
    const names = manifest.map((entry) => `${entry.namespace.join('.')}.${entry.name}`);
    expect(new Set(names).size).toBe(names.length);
  });

  test('every success with a JSON body has a schema, so no method returns unknown', () => {
    // Downloads of a JSON file the service assembles, the PSP callback that only reads the status,
    // and the OAuth revocation, whose 200 has no body (RFC 7009 2.2).
    const untyped = new Set(['POST /v1/marketing/data-subjects/export', 'GET /v1/reports/jobs/{id}/result', 'POST /v1/psp/webhooks/{provider}', 'POST /v1/oauth/revoke']);
    const missing: string[] = [];
    for (const { path, verb, operation } of operations) {
      const id = `${verb.toUpperCase()} ${path}`;
      if (untyped.has(id)) continue;
      for (const [status, response] of Object.entries<Json>(operation.responses ?? {})) {
        if (!status.startsWith('2') || ['202', '204', '205'].includes(status)) continue;
        const content: Json | undefined = response.content;
        const schema = content?.['application/json']?.schema;
        if (!content || (content['application/json'] && (!schema || Object.keys(schema).length === 0))) missing.push(`${id} ${status}`);
      }
    }
    expect(missing).toEqual([]);
  });

  test('every public method of every resource belongs to an operation', () => {
    const expected = new Set<string>();
    for (const entry of manifest) {
      expected.add(`${entry.namespace.join('.')}.${entry.name}`);
      if (entry.paginated) expected.add(`${entry.namespace.join('.')}.${entry.name}All`);
    }
    const found = new Set<string>();
    const walk = (node: object, prefix: string[]) => {
      for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(node))) {
        if (name !== 'constructor') found.add([...prefix, name].join('.'));
      }
      for (const [name, child] of Object.entries(node)) {
        if (child instanceof Resource) walk(child, [...prefix, name]);
      }
    };
    const fz = new Ferrazio({ apiKey: 'fz_contract' });
    for (const [name, child] of Object.entries(fz)) if (child instanceof Resource) walk(child, [name]);
    expect([...found].filter((name) => !expected.has(name))).toEqual([]);
    expect([...expected].filter((name) => !found.has(name))).toEqual([]);
  });

  const groups = new Map<string, typeof operations>();
  for (const item of operations) {
    const group = item.path.split('/')[2] ?? 'root';
    groups.set(group, [...(groups.get(group) ?? []), item]);
  }
  for (const [group, items] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    test(`/v1/${group}: ${items.length} operations`, async () => {
      const failures: string[] = [];
      for (const { path, verb, operation } of items) {
        const problems = await check(path, verb, operation);
        if (problems.length > 0) failures.push(`${verb.toUpperCase()} ${path}: ${problems.join('; ')}`);
      }
      expect(failures).toEqual([]);
    });
  }
});
