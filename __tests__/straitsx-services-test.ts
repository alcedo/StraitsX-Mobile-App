import { loadSettings, saveSettings } from '@/src/lib/settings-storage';
import { getAccountBalances } from '@/src/lib/straitsx/balances';
import { getBaseUrl, StraitsXApiError, StraitsXClient } from '@/src/lib/straitsx/client';
import { createVirtualBankAccount } from '@/src/lib/straitsx/payments';
import { getAccountStatement } from '@/src/lib/straitsx/statements';
import { createSwapQuote, executeSwap, getSwapPairs } from '@/src/lib/straitsx/swaps';
import { createWithdrawal, getBankAccounts } from '@/src/lib/straitsx/withdrawals';
import { createBlockchainWithdrawal, getBlockchainAddresses } from '@/src/lib/straitsx/blockchain';

const sandboxKey = 'sandbox_test_key';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    text: jest.fn(() => Promise.resolve(JSON.stringify(body))),
  } as unknown as Response;
}

function createClient(fetchImpl = jest.fn(() => Promise.resolve(jsonResponse({ data: [] })))) {
  return new StraitsXClient({
    apiKey: sandboxKey,
    environment: 'sandbox',
    fetchImpl: fetchImpl as unknown as typeof fetch,
  });
}

describe('StraitsX sandbox services', () => {
  test('uses the sandbox base URL', () => {
    expect(getBaseUrl('sandbox')).toBe('https://api-sandbox.straitsx.com/v1');
  });

  test('adds sandbox API key header and normalizes errors', async () => {
    const fetchImpl = jest.fn(() => Promise.resolve(jsonResponse({ error: 'Nope', error_code: 'XFE000' }, false, 400)));
    const client = createClient(fetchImpl);

    await expect(getAccountBalances(client)).rejects.toEqual(expect.any(StraitsXApiError));
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api-sandbox.straitsx.com/v1/merchant/account-balance',
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers),
      }),
    );
    const firstCall = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const headers = firstCall[1].headers as Headers;
    expect(headers.get('X-XFERS-APP-API-KEY')).toBe(sandboxKey);
  });

  test('calls balance, statement, payment, withdrawal, blockchain, and swap endpoints in sandbox', async () => {
    const fetchImpl = jest.fn(() => Promise.resolve(jsonResponse({ data: [] })));
    const client = createClient(fetchImpl);

    await getAccountBalances(client);
    await getAccountStatement(client, {
      currency: 'xsgd',
      from: '2026-04-01T00:00:00.000Z',
      to: '2026-04-25T00:00:00.000Z',
    });
    await createVirtualBankAccount(client, { referenceId: 'ref_1', currency: 'SGD', network: 'fast' });
    await getBankAccounts(client);
    await createWithdrawal(client, {
      idempotencyId: 'withdraw_1',
      bankAccountId: 'bank_account_1',
      amount: '10.00',
      network: 'fast',
      walletSource: 'xsgd',
    });
    await getBlockchainAddresses(client);
    await createBlockchainWithdrawal(client, {
      address_id: 'blockchain_address_1',
      amount: 5,
      idempotency_id: 'chain_1',
      wallet_source: 'xsgd',
    });
    await getSwapPairs(client);
    await createSwapQuote(client, {
      swapPair: 'XSGDUSDC',
      sourceCurrency: 'XSGD',
      targetCurrency: 'USDC',
      fixedSide: 'source',
      amount: '10.00',
    });
    await executeSwap(client, { idempotencyId: 'swap_1', quoteId: 'quote_1' });

    const urls = (fetchImpl.mock.calls as unknown as Array<[string, RequestInit]>).map(([url]) => String(url));
    expect(urls.every((url) => url.startsWith('https://api-sandbox.straitsx.com/v1'))).toBe(true);
    expect(urls).toEqual(
      expect.arrayContaining([
        'https://api-sandbox.straitsx.com/v1/merchant/account-balance',
        'https://api-sandbox.straitsx.com/v1/payment_methods/virtual_bank_accounts',
        'https://api-sandbox.straitsx.com/v1/withdrawals/bank-accounts',
        'https://api-sandbox.straitsx.com/v1/withdrawals',
        'https://api-sandbox.straitsx.com/v1/blockchain_transfer/addresses/',
        'https://api-sandbox.straitsx.com/v1/blockchain_transfer/withdrawals/',
        'https://api-sandbox.straitsx.com/v1/swap/pairs',
        'https://api-sandbox.straitsx.com/v1/swap/quotes',
        'https://api-sandbox.straitsx.com/v1/swap/transactions',
      ]),
    );
  });

  test('stores separate sandbox and production keys with sandbox default support', async () => {
    const settings = {
      activeEnvironment: 'sandbox' as const,
      sandboxApiKey: 'sandbox_key',
      productionApiKey: 'production_key',
    };

    await saveSettings(settings);

    await expect(loadSettings()).resolves.toEqual(settings);
  });
});
