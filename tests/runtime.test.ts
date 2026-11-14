import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { parseJson, quoteUnsafeIntegers, serializeQuery } from '../src/core/http.js';
import { VERSION } from '../src/version.js';
import pkg from '../package.json';

describe('64-bit integers without reviver source', () => {
  test('quotes only integer literals a number cannot hold', () => {
    const text = '{"a":9007199254740993,"b":-9007199254740993,"c":9007199254740991,"d":1.5e300,"e":12345678901234567.5,"f":[43791531487657988,1]}';
    expect(JSON.parse(quoteUnsafeIntegers(text))).toEqual({
      a: '9007199254740993',
      b: '-9007199254740993',
      c: 9007199254740991,
      d: 1.5e300,
      e: 12345678901234567.5,
      f: ['43791531487657988', 1],
    });
  });

  test('never touches digits inside strings, escaped quotes included', () => {
    const text = '{"k\\"9007199254740993":"x \\"9007199254740993\\" \\\\","n":9007199254740993}';
    expect(JSON.parse(quoteUnsafeIntegers(text))).toEqual({ 'k"9007199254740993': 'x "9007199254740993" \\', n: '9007199254740993' });
  });

  test('a text without long digit runs is returned as is', () => {
    const text = '{"a":1,"b":"2"}';
    expect(quoteUnsafeIntegers(text)).toBe(text);
  });

  test('gives the same result as the reviver path', () => {
    const samples = [
      { user_id: 43791531487657988n, tenant_id: 1, name: 'a "q" 99999999999999999', list: [2n ** 63n - 1n, -(2n ** 63n), 0.1, 2 ** 53 - 1] },
      [{ id: 18446744073709551615n }, null, true, 'é 12345678901234567890'],
    ];
    for (const sample of samples) {
      const text = JSON.stringify(sample, (_k, v) => (typeof v === 'bigint' ? `@@${v}@@` : v)).replace(/"@@(-?\d+)@@"/g, '$1');
      expect(JSON.parse(quoteUnsafeIntegers(text))).toEqual(parseJson(text) as object);
    }
  });
});

describe('query encoding without URLSearchParams', () => {
  test('matches URLSearchParams byte for byte', () => {
    const query = { q: "a b+c&d=e!'()*~-._", u: 'ação 日本 🚀', n: 10, t: true, list: ['x y', 2], skip: undefined, none: null };
    const expected = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      for (const item of Array.isArray(value) ? value : [value]) expected.append(key, String(item));
    }
    expect(serializeQuery(query)).toBe(`?${expected.toString()}`);
    expect(serializeQuery({})).toBe('');
  });
});

describe('React Native like runtime', () => {
  test('loads and works without process, URL, URLSearchParams, ReadableStream and reviver source', () => {
    const script = join(import.meta.dir, 'fixtures/hermes-like.ts');
    const run = Bun.spawnSync([process.execPath, script], { stdout: 'pipe', stderr: 'pipe' });
    const stderr = run.stderr.toString();
    expect(stderr).toBe('');
    expect(run.exitCode).toBe(0);
    const out = JSON.parse(run.stdout.toString());
    expect(out.reviverSource).toBe(false);
    expect(out.calls[0]).toEqual({
      method: 'GET',
      url: 'https://gw.test/v1/pay/receivables?page_size=20&status=open+now',
      authorization: 'Bearer tok_mobile',
    });
    expect(out.calls[1].body).toBe('signed_request=a+b%21');
    expect(out.calls[1].contentType).toBe('application/x-www-form-urlencoded');
    expect(out.userId).toBe('43791531487657988');
    expect(out.connection).toEqual({ name: 'FerrazioConnectionError', message: 'Could not reach https://gw.test: offline', hasCause: true });
    expect(out.expired).toEqual({ name: 'NotFoundError', unidentified: true });
    expect(out.stepUp).toEqual({ name: 'StepUpRequiredError', error: 'step_up_required', unidentified: false });
  });
});

describe('version', () => {
  test('the User-Agent version is the package version', () => {
    expect(VERSION).toBe(pkg.version);
  });

  test('the snapshot is the document this version was generated from', () => {
    const root = join(import.meta.dir, '..');
    const lock = JSON.parse(readFileSync(join(root, 'openapi/version.json'), 'utf8'));
    // The hash is over the LF text the generator wrote; a CRLF checkout (git on
    // Windows without .gitattributes) must not read as a different document.
    const snapshot = readFileSync(join(root, 'openapi/openapi.json'), 'utf8').replace(/\r\n/g, '\n');
    expect(lock.version).toBe(pkg.version);
    expect(lock.spec_sha256).toBe(new Bun.CryptoHasher('sha256').update(snapshot).digest('hex'));
  });

  test('the edge contract is the one this version ships', () => {
    const root = join(import.meta.dir, '..');
    const lock = JSON.parse(readFileSync(join(root, 'openapi/version.json'), 'utf8'));
    const edge = readFileSync(join(root, 'openapi/edge-contract.json'), 'utf8').replace(/\r/g, '');
    expect(typeof JSON.parse(edge).schema_version).toBe('number');
    expect(lock.edge_contract_sha256).toBe(new Bun.CryptoHasher('sha256').update(edge).digest('hex'));
  });

  test('the reduced OpenAPI document is the snapshot without whitespace', () => {
    const root = join(import.meta.dir, '..');
    const lock = JSON.parse(readFileSync(join(root, 'openapi/version.json'), 'utf8'));
    const snapshot = readFileSync(join(root, 'openapi/openapi.json'), 'utf8').replace(/\r\n/g, '\n');
    const min = JSON.stringify(JSON.parse(snapshot));
    expect(lock.openapi_min_sha256).toBe(new Bun.CryptoHasher('sha256').update(min).digest('hex'));
    const gz = join(root, 'openapi/openapi.min.json.gz');
    if (existsSync(gz)) expect(gunzipSync(readFileSync(gz)).toString('utf8')).toBe(min);
  });
});
