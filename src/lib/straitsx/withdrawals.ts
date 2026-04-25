import { StraitsXClient } from './client';
import { BankAccount, CollectionResponse, ResourceResponse, TransactionResource } from './types';

export type CreateBankAccountInput = {
  accountNo: string;
  accountHolderName: string;
  bank?: string;
  swiftBic?: string;
  bankName?: string;
  routingCode?: string;
};

export type CreateWithdrawalInput = {
  idempotencyId: string;
  bankAccountId: string;
  amount: string;
  network: 'fast' | 'swift';
  walletSource: 'sgd' | 'usd' | 'xsgd' | 'xusd';
};

export function getBankAccounts(client: StraitsXClient) {
  return client.get<CollectionResponse<BankAccount>>('/withdrawals/bank-accounts');
}

export function createBankAccount(client: StraitsXClient, input: CreateBankAccountInput) {
  return client.post<ResourceResponse<BankAccount>>('/withdrawals/bank-accounts', {
    data: {
      attributes: input,
    },
  });
}

export function getBankAccount(client: StraitsXClient, id: string) {
  return client.get<ResourceResponse<BankAccount>>(`/withdrawals/bank-accounts/${id}`);
}

export function createWithdrawal(client: StraitsXClient, input: CreateWithdrawalInput) {
  return client.post<ResourceResponse<TransactionResource>>('/withdrawals', {
    data: {
      attributes: input,
    },
  });
}

export function getWithdrawal(client: StraitsXClient, id: string) {
  return client.get<ResourceResponse<TransactionResource>>(`/withdrawals/${id}`);
}
