import { QueryParams, StraitsXClient } from './client';
import { CollectionResponse, StatementEntry } from './types';

export type StatementParams = {
  currency: string;
  from: string;
  to: string;
  pageSize?: number;
  pageNumber?: number;
};

export function getAccountStatement(client: StraitsXClient, params: StatementParams) {
  const query: QueryParams = {
    'filter[currency]': params.currency.toLowerCase(),
    'filter[from]': params.from,
    'filter[to]': params.to,
    'page[size]': params.pageSize ?? 50,
    'page[number]': params.pageNumber ?? 1,
    sort: '-createdAt',
  };

  return client.get<CollectionResponse<StatementEntry>>('/merchant/statements/account-statement', query);
}
