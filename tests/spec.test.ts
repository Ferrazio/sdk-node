import { describe, expect, test } from 'bun:test';
import { acceptedVersions, breakingSpecChanges, nextVersion, normalizeSpec, requiredBump, withoutInternals, type Json } from '../scripts/spec.js';

const doc = (schemas: Json, parameters: Json[] = []): Json => ({
  paths: { '/v1/x': { get: { parameters }, post: { requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Input' } } } } } } },
  components: { schemas },
});
const query = (name: string, required = false, schema: Json = { type: 'string' }) => ({ in: 'query', name, required, schema });

describe('normalizeSpec', () => {
  test('swaps typographic dashes and drops guide citations', () => {
    const text = JSON.stringify({ description: 'x \u2014 y \u2013 z (GUIDE.md regra 3)' });
    expect(normalizeSpec(text)).toEqual({ description: 'x - y - z' });
  });

  test('drops internal record and backlog codes from prose, keeps standards and machine fields', () => {
    const text = JSON.stringify({
      paths: { '/v1/x': { get: { operationId: 'ABC-XY-03', summary: 'Lista (ADR-0001 D2).', description: 'Paginada (`ABC-12`, ADR-0002 D3) em UTF-8, hash SHA-256 (handler.rs).' } } },
      info: { title: 'T', description: 'Redis', contact: { email: 'x@y' } },
    });
    const spec = normalizeSpec(text);
    expect(spec.paths['/v1/x'].get).toEqual({ operationId: 'ABC-XY-03', summary: 'Lista.', description: 'Paginada em UTF-8, hash SHA-256.' });
    expect(spec.info.contact).toBeUndefined();
    expect(spec.info.description).not.toContain('Redis');
  });
});

describe('withoutInternals', () => {
  test('drops paragraphs about backend internals and headings left empty', () => {
    const text = 'Lists the items.\n\n# Flow\n\n1. Calls `auth` over gRPC.\n\n# Errors\n\n`404` when missing.';
    expect(withoutInternals(text)).toBe('Lists the items.\n\n# Errors\n\n`404` when missing.');
    expect(withoutInternals('Session lives in Redis.')).toBe('');
  });
});

describe('breakingSpecChanges', () => {
  test('an added field, schema, optional parameter or enum value breaks nothing', () => {
    const before = doc({ Kind: { type: 'string', enum: ['a'] }, Input: { type: 'object', properties: { a: { type: 'string' } } } });
    const after = doc(
      {
        Kind: { type: 'string', enum: ['a', 'b'] },
        Input: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } },
        Other: { type: 'object' },
      },
      [query('q')],
    );
    expect(breakingSpecChanges(before, after)).toEqual([]);
  });

  test('a new alternative breaks a response union, not a request one', () => {
    const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
    const before = doc({ Reply: { oneOf: [ref('A'), ref('B')] }, Input: { oneOf: [ref('A'), ref('B')] } });
    const after = doc({ Reply: { oneOf: [ref('A'), ref('B'), ref('C')] }, Input: { oneOf: [ref('A'), ref('B'), ref('C')] } });
    expect(breakingSpecChanges(before, after)).toEqual(['response variant added: Reply #/components/schemas/C']);
  });

  test('an enum value removed, also in a schema without properties or spelled as oneOf', () => {
    const before = doc({ Kind: { type: 'string', enum: ['a', 'b'] }, One: { oneOf: [{ type: 'string', enum: ['x'] }, { type: 'string', enum: ['y'] }] } });
    const after = doc({ Kind: { type: 'string', enum: ['a'] }, One: { oneOf: [{ type: 'string', enum: ['x'] }] } });
    expect(breakingSpecChanges(before, after)).toEqual(['enum value removed: Kind "b"', 'enum value removed: One "y"']);
  });

  test('a parameter removed, retyped, turned required or added as required', () => {
    const before = doc({}, [query('gone'), query('kept'), query('count')]);
    const after = doc({}, [query('kept', true), query('count', false, { type: 'integer' }), query('fresh', true)]);
    expect(breakingSpecChanges(before, after)).toEqual([
      'parameter removed: GET /v1/x query gone',
      'parameter now required: GET /v1/x query kept',
      'parameter retyped: GET /v1/x query count string -> integer',
      'parameter now required: GET /v1/x query fresh',
    ]);
  });

  test('a oneOf field: nullable is no retype, one more variant in a response, a lost one or a single type becoming several is', () => {
    const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
    const shape = (field: Json): Json => doc({ Out: { type: 'object', properties: { field } } });
    expect(breakingSpecChanges(shape(ref('A')), shape({ oneOf: [ref('A'), { type: 'null' }] }))).toEqual([]);
    expect(breakingSpecChanges(shape({ oneOf: [ref('A'), ref('B')] }), shape({ oneOf: [ref('A'), ref('B'), ref('C')] }))).toEqual(['response variant added: Out.field #/components/schemas/C']);
    expect(breakingSpecChanges(shape(ref('A')), shape({ oneOf: [ref('A'), ref('B')] }))).toHaveLength(1);
    expect(breakingSpecChanges(shape({ oneOf: [ref('A'), ref('B')] }), shape({ oneOf: [ref('A')] }))).toHaveLength(1);
  });

  test('fields, schemas and required request fields, also nested', () => {
    const nested = (properties: Json, required: string[] = []) => ({ type: 'object', properties: { inner: { type: 'object', properties, required } } });
    const before = doc({ Input: nested({ a: { type: 'string' } }), Out: { type: 'object', properties: { b: { type: 'string' } } }, Gone: { type: 'object' } });
    const after = doc({ Input: nested({ a: { type: 'string' } }, ['a']), Out: { type: 'object', properties: {} } });
    expect(breakingSpecChanges(before, after)).toEqual(['request field now required: Input.inner.a', 'field removed: Out.b', 'schema removed: Gone']);
  });

  test('a new required field only breaks a schema that is an input', () => {
    const shape = (required: string[]): Json => doc({ Input: { type: 'object', required }, Out: { type: 'object', required } });
    expect(breakingSpecChanges(shape([]), shape(['a']))).toEqual(['request field now required: Input.a']);
  });
});

describe('version bumps', () => {
  test('major only for a breaking change, minor for something new, patch otherwise', () => {
    expect(requiredBump(true, true)).toBe('major');
    expect(requiredBump(false, true)).toBe('minor');
    expect(requiredBump(false, false)).toBe('patch');
  });

  test('the next version of each level', () => {
    expect(nextVersion('6.0.2', 'major')).toBe('7.0.0');
    expect(nextVersion('6.0.2', 'minor')).toBe('6.1.0');
    expect(nextVersion('6.0.2', 'patch')).toBe('6.0.3');
    expect(nextVersion('0.6.3', 'major')).toBe('0.7.0');
  });

  test('exactly the next version, never a higher level nor a skipped number', () => {
    expect(acceptedVersions('6.0.2', 'minor')).toEqual(['6.1.0']);
    expect(acceptedVersions('6.0.2', 'patch')).toEqual(['6.0.3', '6.1.0']);
    expect(acceptedVersions('6.0.2', 'major')).toEqual(['7.0.0']);
  });
});
