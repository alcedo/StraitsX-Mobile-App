import { QueryParams, StraitsXClient } from './client';
import { CollectionResponse, ResourceResponse, SwapPair, SwapQuote, TransactionResource } from './types';

export type CreateSwapQuoteInput = {
  swapPair: string;
  sourceCurrency: string;
  targetCurrency: string;
  fixedSide: 'source' | 'target';
  amount: string;
};

export type ExecuteSwapInput = {
  idempotencyId: string;
  quoteId: string;
};

export function getSwapPairs(client: StraitsXClient) {
  return client.get<CollectionResponse<SwapPair>>('/swap/pairs');
}

export function createSwapQuote(client: StraitsXClient, input: CreateSwapQuoteInput) {
  return client.post<ResourceResponse<SwapQuote>>('/swap/quotes', {
    data: {
      attributes: input,
    },
  });
}

export function getSwapQuote(client: StraitsXClient, quoteId: string) {
  return client.get<ResourceResponse<SwapQuote>>(`/swap/quotes/${quoteId}`);
}

export function executeSwap(client: StraitsXClient, input: ExecuteSwapInput) {
  return client.post<ResourceResponse<TransactionResource>>('/swap/transactions', {
    data: {
      attributes: input,
    },
  });
}

export function getSwapTransactions(client: StraitsXClient, query?: QueryParams) {
  return client.get<CollectionResponse<TransactionResource>>('/swap/transactions', query);
}

export function getSwapTransaction(client: StraitsXClient, contractId: string) {
  return client.get<ResourceResponse<TransactionResource>>(`/swap/transactions/${contractId}`);
}
