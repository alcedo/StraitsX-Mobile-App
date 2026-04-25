import { StraitsXClient } from './client';
import { CollectionResponse, PaymentMethod, ResourceResponse } from './types';

export type CreateVirtualBankAccountInput = {
  referenceId: string;
  currency: 'SGD' | 'USD';
  network?: 'fast' | 'meps' | 'swift';
  bankShortCode?: string;
};

export function getPaymentMethods(client: StraitsXClient) {
  return client.get<CollectionResponse<PaymentMethod>>('/payment_methods');
}

export function createVirtualBankAccount(client: StraitsXClient, input: CreateVirtualBankAccountInput) {
  return client.post<ResourceResponse<PaymentMethod>>('/payment_methods/virtual_bank_accounts', {
    data: {
      attributes: {
        referenceId: input.referenceId,
        currency: input.currency,
        network: input.network,
        bankShortCode: input.bankShortCode,
      },
    },
  });
}

export function getVirtualBankAccount(client: StraitsXClient, id: string) {
  return client.get<ResourceResponse<PaymentMethod>>(`/payment_methods/virtual_bank_accounts/${id}`);
}
