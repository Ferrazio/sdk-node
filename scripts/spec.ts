/**
 * What the generator and `scripts/deriva-back.ts` must agree on: how a gateway
 * document becomes the snapshot, and what counts as a change that breaks code
 * written against the previous one.
 */

export type Json = Record<string, any>;

export const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

/**
 * Codes of public standards that look like reference codes and must stay
 * (`SHA-256`, `ISO-8601`, `UTF-8`, `RFC-7009`, `EAN-13`, `NR-6`).
 */
const STANDARD_CODES = new Set(['SHA', 'ISO', 'UTF', 'RFC', 'EAN', 'NR', 'YYYY', 'MM', 'DD', 'CH', 'PRETO']);

/** A design-record citation with its optional section list: `ADR-0183 D11`, `ADR 0343 D4`, `ADR-0233 E49`. */
const RECORD = String.raw`ADR[- ]?\d{3,4}(?:(?:[ -]|\s)?[A-Z]\d{1,3}(?:\s*(?:,|e|a|-|/)\s*[A-Z]?\d{1,3})*)?(?::[^)\n"]*)?`;
/** A backlog or review code: `RES-118`, `API-PAY-04`, `SV-69`, `MA16`-style codes stay. */
const TICKET = String.raw`\b([A-Z]{2,5})(?:-[A-Z]{2,4})?-\d{1,4}[a-z]?\b`;

/**
 * Turns a text of the backend's document into text fit for a public reference:
 * citations of internal design records, backlog codes, source files and
 * internal guides are dropped, together with the parentheses and separators
 * they leave behind.
 */
export function publicText(text: string): string {
  let out = text
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/ \([A-Z][A-Z_]*\.md(?:\s)+regra \d+\)/g, '')
    .replace(new RegExp('`?' + RECORD + '`?', 'g'), '')
    .replace(new RegExp('`?' + TICKET + '`?', 'g'), (match, prefix: string) => (STANDARD_CODES.has(prefix) ? match : ''))
    .replace(/\s*\(?`?[\w/]+\.rs`?\)?/g, '')
    .replace(/`crates\/[\w-]+`/g, 'the platform rules')
    .replace(/\bROUTE_PERMISSIONS\b,?\s*/g, '')
    .replace(/,\s*D\d{1,3}(?:\s*(?:a|e|,|-|\/)\s*D?\d{1,3})*\)/g, ')')
    .replace(/\s*\(regra dura \d+\)/g, '')
    .replace(/: erro de driver \(Postgres, Redis, gRPC\) é traduzido na fronteira de infraestrutura e registrado no log, nunca devolvido ao cliente/g, ': detalhes da falha ficam no log do servidor, nunca na resposta. Cite o `request_id` ao falar com o suporte')
    .replace(/microsserviço de destino fora do ar, Redis de sessão inalcançável ou circuito aberto/g, 'serviço de destino ou de sessão fora do ar')
    .replace(/ Entitlement é enforçado SÓ na borda: o microsserviço nunca vê 402\. Indisponibilidade do `fz_iam` não produz este código: sem evidência a resposta é 503\.?/g, ' Se a contratação não puder ser conferida, a resposta é 503, nunca 402.')
    .replace(/`RequestBodyLimitLayer`/g, 'gateway')
    .replace(/\s*\(?(?:via )?`grpc\.health\.v1\.Health\/Check`\)?/g, '')
    .replace(/`?\bfz_(?!session\b|role\b)([a-z][a-z_]*)\b`?/g, '`$1`')
    .replace(/\[`([A-Za-z_:]+)`\]/g, '`$1`');
  // Tidy what the removals leave: empty or dangling parentheses and separators.
  for (let pass = 0; pass < 3; pass++) {
    out = out
      .replace(/\(\s*(?:[,;/]|\be\b|\s)*\)/g, '')
      .replace(/\s*\(\s*(?:README )?`?D\d{1,3}(?:\s*(?:a|e|,|-|\/)\s*D?\d{1,3})*`?\s*\)/g, '')
      .replace(/ D\d{1,3} da\s+(?=para )/g, ' ')
      .replace(/\(\s*[,;/]\s*/g, '(')
      .replace(/\s*[,;/]\s*\)/g, ')')
      .replace(/\(\s*(?:envelope(?: keyset(?:\/cursor)?)?)\s*\)/g, '(envelope keyset)')
      .replace(/\s*[,;]\s*(?=[,;.])/g, '')
      .replace(/[ \t]+([.,;:])/g, '$1')
      .replace(/[ \t]*\n[ \t]*([.,;])(?=\s|$)/g, '$1')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/^[ \t]+$/gm, '');
  }
  return out;
}

/** Prose about how the backend works inside (storage, transport, code layout), not about the API contract. */
const INTERNALS = /\b(?:Redis|gRPC|sqlx|tonic|SQLSTATE|Postgres|middleware|use case|crate|microsservi\w*|outbox|Auth0)\b/i;
const INTERNAL_CALL = /[;,]?\s*(?:forwards [^.;]* to `\w+` |calls `\w+` )?(?:via|over) gRPC/g;

/**
 * Drops the paragraphs of a description that narrate the backend's internals.
 * Section headings left without a body go with them.
 */
export function withoutInternals(text: string): string {
  const paragraphs = text.split(/\n{2,}/);
  const kept = paragraphs.filter((paragraph) => !INTERNALS.test(paragraph));
  const heading = (paragraph: string | undefined) => paragraph !== undefined && /^#+ [^\n]*$/.test(paragraph.trim());
  // A section heading whose whole body was dropped goes too.
  return kept.filter((paragraph, index) => !heading(paragraph) || (index + 1 < kept.length && !heading(kept[index + 1]))).join('\n\n').trim();
}

const PUBLIC_INFO = 'Ferrazio REST API. Authenticate with an API key, a session token or an OAuth app access token, all opaque.';

/** Applies {@link publicText} to every `summary`, `description` and `title` of a document. */
function publicDocument(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(publicDocument);
  if (!node || typeof node !== 'object') return node;
  const out: Json = {};
  for (const [field, value] of Object.entries(node)) {
    if (typeof value === 'string' && (field === 'summary' || field === 'description' || field === 'title')) {
      out[field] = field === 'description' ? withoutInternals(publicText(value)) : publicText(value).replace(INTERNAL_CALL, '');
    } else out[field] = publicDocument(value);
  }
  return out;
}

/**
 * The gateway document as the SDK publishes it: typographic dashes become plain
 * hyphens and the prose is cleaned by {@link publicText}. Routes, schemas and
 * every machine-read field are kept as they are.
 */
export function normalizeSpec(sourceText: string): Json {
  const spec = publicDocument(JSON.parse(sourceText.replace(/[\u2014\u2013]/g, '-'))) as Json;
  if (spec.info) {
    spec.info.description = PUBLIC_INFO;
    delete spec.info.contact;
  }
  return spec;
}

export function snapshotText(spec: Json): string {
  return `${JSON.stringify(spec, null, 1)}\n`;
}

// The snapshot without whitespace: the same document, parsed the same way. The
// package ships it gzipped as openapi/openapi.min.json.gz, and version.json
// holds the sha256 of this text in openapi_min_sha256.
export function minifiedText(snapshot: string): string {
  return JSON.stringify(JSON.parse(snapshot));
}

export function sha256(text: string): string {
  return new Bun.CryptoHasher('sha256').update(text).digest('hex');
}

/** `GET /v1/x` of every operation of `document`, with the operation itself. */
export function operationsOf(document: Json): Map<string, Json> {
  const found = new Map<string, Json>();
  for (const [path, item] of Object.entries<Json>(document.paths ?? {})) {
    for (const method of METHODS) {
      if (item[method]) found.set(`${method.toUpperCase()} ${path}`, item[method]);
    }
  }
  return found;
}

/** Schemas reachable from `roots`, following `$ref` through the components of `document`. */
export function reachableSchemas(document: Json, ...roots: unknown[]): Set<string> {
  const all: Json = document.components?.schemas ?? {};
  const found = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    const ref = (node as Json).$ref;
    if (typeof ref === 'string' && ref.startsWith('#/components/schemas/')) {
      const name = ref.slice('#/components/schemas/'.length);
      if (!found.has(name)) {
        found.add(name);
        walk(all[name]);
      }
    }
    Object.values(node).forEach(walk);
  };
  roots.forEach(walk);
  return found;
}

/** Schemas reachable from some request body or parameter of `document`. */
function requestSchemas(document: Json): Set<string> {
  return reachableSchemas(document, ...[...operationsOf(document).values()].flatMap((operation) => [operation.requestBody, operation.parameters]));
}

/** The alternatives of a schema, without `null`: nullability is not a retype. */
function variants(property: Json): string[] {
  const list: Json[] | undefined = property.oneOf ?? property.anyOf;
  if (!list) return [typeOf(property)];
  return [...new Set(list.filter((item) => item.type !== 'null').flatMap(variants))].sort();
}

function typeOf(property: Json | undefined): string {
  if (!property) return '';
  if (property.$ref) return String(property.$ref);
  if (property.oneOf || property.anyOf) return variants(property).join('|');
  if (property.allOf) return property.allOf.map(typeOf).join('&');
  const type = Array.isArray(property.type) ? property.type.filter((t: string) => t !== 'null').join('|') : property.type;
  return `${type ?? ''}${property.items ? `<${typeOf(property.items)}>` : ''}`;
}

/** Literal values a schema accepts, including those spelled as `oneOf` of single-value enums. */
function literals(schema: Json): unknown[] {
  const own: unknown[] = [...(schema.enum ?? []), ...('const' in schema ? [schema.const] : [])];
  return own.concat(...(schema.oneOf ?? schema.anyOf ?? []).map(literals));
}

/** A new alternative is not a retype; losing one, or a single type becoming several, is. */
function retyped(old: Json, cur: Json): boolean {
  const before = variants(old);
  const after = new Set(variants(cur));
  return before.some((item) => !after.has(item)) || (before.length === 1 && after.size > 1);
}

function compareSchema(at: string, old: Json, cur: Json, isInput: boolean, out: string[]): void {
  const values = new Set(literals(cur));
  for (const value of literals(old)) {
    if (!values.has(value)) out.push(`enum value removed: ${at} ${JSON.stringify(value)}`);
  }
  for (const [field, property] of Object.entries<Json>(old.properties ?? {})) {
    const next = cur.properties?.[field];
    if (!next) out.push(`field removed: ${at}.${field}`);
    else if (retyped(property, next)) out.push(`field retyped: ${at}.${field} ${typeOf(property)} -> ${typeOf(next)}`);
    else compareSchema(`${at}.${field}`, property, next, isInput, out);
  }
  if (old.items && cur.items) {
    if (retyped(old.items, cur.items)) out.push(`items retyped: ${at} ${typeOf(old.items)} -> ${typeOf(cur.items)}`);
    else compareSchema(`${at}[]`, old.items, cur.items, isInput, out);
  }
  if (!old.properties && !cur.properties && !old.items && !cur.items && retyped(old, cur)) {
    out.push(`schema retyped: ${at} ${typeOf(old)} -> ${typeOf(cur)}`);
  }
  if (!isInput) {
    // A response that can come back in a shape it never had: code that narrows
    // the old alternatives (`'token' in login ? ... : login.other`) stops compiling.
    const before = new Set(variants(old));
    const added = before.size > 1 ? variants(cur).filter((item) => !before.has(item)) : [];
    if (added.length > 0) out.push(`response variant added: ${at} ${added.join('|')}`);
    return;
  }
  const required = new Set<string>(old.required ?? []);
  for (const field of cur.required ?? []) {
    if (!required.has(field)) out.push(`request field now required: ${at}.${field}`);
  }
}

function compareParameters(route: string, old: Json, cur: Json, out: string[]): void {
  const id = (parameter: Json) => `${parameter.in} ${parameter.name}`;
  const before = new Map<string, Json>((old.parameters ?? []).map((parameter: Json) => [id(parameter), parameter]));
  const after = new Map<string, Json>((cur.parameters ?? []).map((parameter: Json) => [id(parameter), parameter]));
  for (const [name, parameter] of before) {
    const next = after.get(name);
    if (!next) {
      out.push(`parameter removed: ${route} ${name}`);
      continue;
    }
    if (next.required && !parameter.required) out.push(`parameter now required: ${route} ${name}`);
    if (next.schema && parameter.schema) {
      if (retyped(parameter.schema, next.schema)) {
        out.push(`parameter retyped: ${route} ${name} ${typeOf(parameter.schema)} -> ${typeOf(next.schema)}`);
      } else compareSchema(`${route} ${name}`, parameter.schema, next.schema, true, out);
    }
  }
  for (const [name, parameter] of after) {
    if (parameter.required && !before.has(name)) out.push(`parameter now required: ${route} ${name}`);
  }
}

/**
 * Schema and parameter changes between two documents that would stop code written
 * against `before` from compiling or working. Operations that disappeared are for
 * the caller: the generator also knows the method names.
 */
export function breakingSpecChanges(before: Json, after: Json): string[] {
  const out: string[] = [];
  const now = operationsOf(after);
  for (const [route, old] of operationsOf(before)) {
    const cur = now.get(route);
    if (cur) compareParameters(route, old, cur, out);
  }
  const inputs = requestSchemas(after);
  const schemas: Json = after.components?.schemas ?? {};
  for (const [name, old] of Object.entries<Json>(before.components?.schemas ?? {})) {
    if (schemas[name]) compareSchema(name, old, schemas[name], inputs.has(name), out);
    else out.push(`schema removed: ${name}`);
  }
  return out;
}

export type Bump = 'major' | 'minor' | 'patch';

/**
 * The bump a new version needs: major for a breaking change, minor for anything
 * new in the spec or the edge contract (an operation, a field, a schema), patch
 * when neither changed (a fix in src/core, the docs, the package).
 */
export function requiredBump(breaking: boolean, changed: boolean): Bump {
  return breaking ? 'major' : changed ? 'minor' : 'patch';
}

/** The version right after `from` for `bump` (a major in 0.x moves the minor). */
export function nextVersion(from: string, bump: Bump): string {
  const [major = 0, minor = 0, patch = 0] = from.split('.').map((n) => Number.parseInt(n, 10));
  if (bump === 'major') return major === 0 ? `0.${minor + 1}.0` : `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * The versions accepted after `from` for `bump`: exactly the next one, never a
 * skipped number nor a higher level. A patch round may ship as minor when the
 * SDK itself gains something (a helper, a file in the package).
 */
export function acceptedVersions(from: string, bump: Bump): string[] {
  return bump === 'patch' ? [nextVersion(from, 'patch'), nextVersion(from, 'minor')] : [nextVersion(from, bump)];
}
