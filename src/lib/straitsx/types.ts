export type JsonApiResource<TAttributes = Record<string, unknown>> = {
  id: string;
  type: string;
  attributes: TAttributes;
};

export type CollectionResponse<T> = {
  data: T[];
  meta?: {
    total?: number;
    pages?: number;
    [key: string]: unknown;
  };
  links?: Record<string, string>;
};

export type ResourceResponse<T> = {
  data: T;
};

export type Balance = JsonApiResource<{
  amount: string;
  currency: string;
}>;

export type StatementEntry = JsonApiResource<{
  type: string;
  status: string;
  contractId?: string;
  creditDebitIndicator?: 'Credit' | 'Debit' | string;
  amount: number;
  ledgerBalance?: number;
  currency: string;
  createdAt: string;
  description?: string | null;
  transactionReference?: string | null;
  counterpartyDetails?: Record<string, unknown>;
}>;

export type PaymentMethod = JsonApiResource<{
  referenceId?: string;
  status?: string;
  instructions?: {
    bankShortCode?: string;
    accountNo?: string;
    recipient_name?: string;
    bank_payee_name?: string;
  };
  paymentMethod?: {
    id?: string;
    type?: string;
    base64EncodedImage?: string;
    expiresAt?: string;
  };
  [key: string]: unknown;
}>;

export type BankAccount = JsonApiResource<{
  accountHolderName: string;
  accountNo: string;
  bank?: string;
  swiftBic?: string;
  status: string;
  createdAt?: string;
}>;

export type BlockchainAddress = {
  data: JsonApiResource<{
    token: string;
    blockchain_address: string;
    network: string;
    address_label: string;
    verification_status: string;
    created_at: string;
  }>;
};

export type SwapPair = JsonApiResource<{
  code: string;
}>;

export type SwapQuote = JsonApiResource<{
  quoteId?: string;
  swapPair?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  fixedSide?: string;
  sourceCurrencyAmount?: string;
  targetCurrencyAmount?: string;
  totalSourceCurrencyAmount?: string;
  rate?: string;
  expiresAt?: string;
  fees?: { type: string; amount: string; currency: string }[];
  [key: string]: unknown;
}>;

export type TransactionResource = JsonApiResource<{
  amount?: string;
  fees?: string | Record<string, unknown>[];
  status?: string;
  currency?: string;
  idempotencyId?: string;
  idempotency_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  [key: string]: unknown;
}>;
