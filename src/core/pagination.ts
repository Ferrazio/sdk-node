/** Options of {@link Paginator.toArray}. */
export interface ToArrayOptions {
  /** Stop after this many items. Without it every page is fetched. */
  limit?: number;
}

/**
 * Walks a cursor-paginated collection.
 *
 * Every list route of the platform answers `{ <items>, next_page_token }`
 * and takes the cursor back in `page_token`; an empty token means last page.
 *
 * @example
 * for await (const receivable of fz.pay.receivables.listAll({ page_size: 100 })) {
 *   console.log(receivable.id);
 * }
 */
export class Paginator<TItem, TPage = unknown> implements AsyncIterable<TItem> {
  constructor(
    private readonly fetchPage: (pageToken: string | undefined) => Promise<TPage>,
    /** Field holding the items. Without it the page's `items`, or its only array, is used. */
    private readonly itemsField?: string,
    private readonly startToken?: string,
  ) {}

  /** Yields page by page, as the API returns them. */
  async *pages(): AsyncGenerator<TPage, void, undefined> {
    let token = this.startToken || undefined;
    for (;;) {
      const page = await this.fetchPage(token);
      yield page;
      const next = (page as { next_page_token?: unknown } | null | undefined)?.next_page_token;
      if (typeof next !== 'string' || next === '' || next === token) return;
      token = next;
    }
  }

  /** Yields item by item, fetching the next page on demand. */
  async *[Symbol.asyncIterator](): AsyncGenerator<TItem, void, undefined> {
    for await (const page of this.pages()) {
      const items = itemsOf(page, this.itemsField);
      if (Array.isArray(items)) yield* items as TItem[];
    }
  }

  /** Collects the items into an array. Use `limit` on large collections. */
  async toArray(options: ToArrayOptions = {}): Promise<TItem[]> {
    const out: TItem[] = [];
    if (options.limit !== undefined && options.limit <= 0) return out;
    for await (const item of this) {
      out.push(item);
      if (options.limit !== undefined && out.length >= options.limit) break;
    }
    return out;
  }
}

function itemsOf(page: unknown, field: string | undefined): unknown {
  if (typeof page !== 'object' || page === null) return undefined;
  const record = page as Record<string, unknown>;
  if (field !== undefined) return record[field];
  if (Array.isArray(record.items)) return record.items;
  const arrays = Object.values(record).filter(Array.isArray);
  return arrays.length === 1 ? arrays[0] : undefined;
}
