import { StraitsXClient } from './client';
import { Balance, CollectionResponse } from './types';

export function getAccountBalances(client: StraitsXClient) {
  return client.get<CollectionResponse<Balance>>('/merchant/account-balance');
}
