/**
 * Writes openapi/openapi.min.json.gz, the reduced OpenAPI document the package
 * ships: openapi/openapi.json without whitespace, gzipped. The uncompressed
 * text must hash to openapi_min_sha256 in openapi/version.json, so the file
 * always matches the snapshot this version was generated from.
 *
 * Usage: bun scripts/pack-openapi.ts (runs in prepack)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { minifiedText, sha256 } from './spec.js';

const ROOT = join(import.meta.dir, '..');
const lock = JSON.parse(readFileSync(join(ROOT, 'openapi/version.json'), 'utf8')) as { openapi_min_sha256?: string };
const min = minifiedText(readFileSync(join(ROOT, 'openapi/openapi.json'), 'utf8').replace(/\r\n/g, '\n'));
if (lock.openapi_min_sha256 !== sha256(min)) {
  console.error('openapi/openapi.json does not match openapi_min_sha256 in openapi/version.json: run the generator first');
  process.exit(1);
}
const gz = gzipSync(min, { level: 9 });
writeFileSync(join(ROOT, 'openapi/openapi.min.json.gz'), gz);
console.log(`openapi/openapi.min.json.gz: ${min.length} bytes, ${gz.length} gzipped, sha256 ${lock.openapi_min_sha256}`);
