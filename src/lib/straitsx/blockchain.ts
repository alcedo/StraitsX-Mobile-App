import { StraitsXClient } from './client';
import { BlockchainAddress, TransactionResource } from './types';

export type EstimateNetworkFeeInput = {
  address_id: string;
  amount: number;
  wallet_source?: 'sgd' | 'usd' | 'xsgd' | 'xusd';
};

export type CreateBlockchainWithdrawalInput = EstimateNetworkFeeInput & {
  idempotency_id: string;
};

export function getBlockchainAddresses(client: StraitsXClient) {
  return client.get<BlockchainAddress[]>('/blockchain_transfer/addresses/');
}

export function estimateNetworkFee(
  client: StraitsXClient,
  blockchain: string,
  input: EstimateNetworkFeeInput,
) {
  return client.post<TransactionResource[]>(
    `/blockchain_transfer/withdrawals/${encodeURIComponent(blockchain)}/estimate_network_fee`,
    input,
  );
}

export function createBlockchainWithdrawal(client: StraitsXClient, input: CreateBlockchainWithdrawalInput) {
  return client.post<TransactionResource[]>('/blockchain_transfer/withdrawals/', input);
}

export function getBlockchainWithdrawal(client: StraitsXClient, id: string) {
  return client.get<TransactionResource[]>(`/blockchain_transfer/withdrawals/${id}`);
}

export function getBlockchainWithdrawals(client: StraitsXClient) {
  return client.get<TransactionResource[]>('/blockchain_transfer/withdrawals');
}
