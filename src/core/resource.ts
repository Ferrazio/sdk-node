import { FerrazioError } from './errors.js';
import type { HttpClient } from './http.js';

/** Base of every generated resource: holds the shared HTTP engine. */
export class Resource {
  /** @internal */
  protected readonly _http: HttpClient;

  constructor(http: HttpClient) {
    this._http = http;
  }
}

/**
 * Encodes one path parameter.
 *
 * @throws FerrazioError when the value is empty or a dot segment (`.`, `..`,
 * also percent-encoded): URL parsing would resolve it and the request would
 * silently hit another route.
 */
export function seg(value: string | number): string {
  const text = value === undefined || value === null ? '' : String(value);
  if (text === '') throw new FerrazioError('A path parameter is empty or undefined. Check the id passed to this method.');
  if (/^(?:\.|%2e){1,2}$/i.test(text)) throw new FerrazioError(`A path parameter cannot be "${text}": it would change the route.`);
  return encodeURIComponent(text);
}
