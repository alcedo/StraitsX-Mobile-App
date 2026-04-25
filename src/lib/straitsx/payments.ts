import { StraitsXClient } from './client';
import { CollectionResponse, PaymentMethod, ResourceResponse, TransactionResource } from './types';

export type CreateVirtualBankAccountInput = {
  referenceId: string;
  currency: 'SGD' | 'USD';
  network?: 'fast' | 'meps' | 'swift';
  bankShortCode?: string;
};

export type CreatePayNowInput = {
  referenceId: string;
};

export type CreateDynamicPayNowInput = {
  referenceId: string;
  amount: number;
  expiresAt: string;
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

export function createPersistentPayNow(client: StraitsXClient, input: CreatePayNowInput) {
  return client.post<ResourceResponse<PaymentMethod>>('/payment_methods/paynow', {
    data: {
      attributes: {
        referenceId: input.referenceId,
      },
    },
  });
}

export function getPersistentPayNow(client: StraitsXClient, id: string) {
  return client.get<ResourceResponse<PaymentMethod>>(`/payment_methods/paynow/${id}`);
}

export function createDynamicPayNow(client: StraitsXClient, input: CreateDynamicPayNowInput) {
  return client.post<ResourceResponse<TransactionResource>>('/payments/paynow', {
    data: {
      attributes: {
        referenceId: input.referenceId,
        amount: input.amount,
        expiresAt: input.expiresAt,
      },
    },
  });
}

export function getDynamicPayNow(client: StraitsXClient, id: string) {
  return client.get<ResourceResponse<TransactionResource>>(`/payments/paynow/${id}`);
}
