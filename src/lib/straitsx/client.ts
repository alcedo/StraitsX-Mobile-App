export type StraitsXEnvironment = 'sandbox' | 'production';

export const STRAITSX_BASE_URLS: Record<StraitsXEnvironment, string> = {
  sandbox: 'https://api-sandbox.straitsx.com/v1',
  production: 'https://api.straitsx.com/v1',
};

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export type StraitsXClientOptions = {
  apiKey: string;
  environment?: StraitsXEnvironment;
  fetchImpl?: typeof fetch;
};

export class StraitsXApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'StraitsXApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getBaseUrl(environment: StraitsXEnvironment = 'sandbox') {
  return STRAITSX_BASE_URLS[environment];
}

export function buildQuery(params?: QueryParams) {
  if (!params) {
    return '';
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function createIdempotencyId(prefix = 'stx_mobile') {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}_${random}`.slice(0, 191);
}

export class StraitsXClient {
  private readonly apiKey: string;
  private readonly environment: StraitsXEnvironment;
  private readonly fetchImpl: typeof fetch;

  constructor({ apiKey, environment = 'sandbox', fetchImpl = fetch }: StraitsXClientOptions) {
    this.apiKey = apiKey;
    this.environment = environment;
    this.fetchImpl = fetchImpl;
  }

  async request<T>(path: string, options: RequestInit & { query?: QueryParams } = {}): Promise<T> {
    if (!this.apiKey.trim()) {
      throw new StraitsXApiError('Add a sandbox API key in Settings before making API calls.', 401);
    }

    const url = `${getBaseUrl(this.environment)}${path}${buildQuery(options.query)}`;
    const hasBody = options.body !== undefined;
    const headers = new Headers(options.headers);

    headers.set('X-XFERS-APP-API-KEY', this.apiKey);
    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await this.fetchImpl(url, {
      ...options,
      headers,
    });

    const text = await response.text();
    const payload = text ? parseJson(text) : null;

    if (!response.ok) {
      const error = normalizeError(payload, response.status);
      throw new StraitsXApiError(error.message, response.status, error.code, payload);
    }

    return payload as T;
  }

  get<T>(path: string, query?: QueryParams) {
    return this.request<T>(path, { method: 'GET', query });
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeError(payload: unknown, status: number) {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message =
      stringValue(record.error) ??
      stringValue(record.message) ??
      stringValue(record.error_description) ??
      `StraitsX request failed with status ${status}`;

    return {
      message,
      code: stringValue(record.error_code) ?? stringValue(record.code),
    };
  }

  return {
    message: typeof payload === 'string' ? payload : `StraitsX request failed with status ${status}`,
    code: undefined,
  };
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
