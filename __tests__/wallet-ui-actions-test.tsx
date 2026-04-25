import { fireEvent, render, waitFor } from '@testing-library/react-native';

import SettingsScreen from '@/app/(tabs)/settings';
import SwapScreen from '@/app/(tabs)/swap';
import TransferInScreen from '@/app/transfer-in';
import TransferOutScreen from '@/app/transfer-out';
import { StraitsXClient } from '@/src/lib/straitsx/client';
import { useAppState } from '@/src/state/app-state';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
  useLocalSearchParams: () => ({ currency: 'xsgd' }),
}));

jest.mock('@/src/state/app-state', () => ({
  useAppState: jest.fn(),
}));

const sandboxKey = 'sandbox_ui_key';
const fetchMock = jest.fn();
const refreshWallet = jest.fn(() => Promise.resolve());
const setSettings = jest.fn(() => Promise.resolve());

function mockJson(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);
}

function setAppState(overrides: Partial<ReturnType<typeof baseState>> = {}) {
  (useAppState as jest.Mock).mockReturnValue({
    ...baseState(),
    ...overrides,
  });
}

function baseState() {
  return {
    settings: {
      activeEnvironment: 'sandbox' as const,
      sandboxApiKey: sandboxKey,
      productionApiKey: 'production_ui_key',
    },
    setSettings,
    client: new StraitsXClient({
      apiKey: sandboxKey,
      environment: 'sandbox',
      fetchImpl: fetchMock as unknown as typeof fetch,
    }),
    hasApiKey: true,
    loadingSettings: false,
    refreshing: false,
    error: null,
    selectedAsset: 'xsgd',
    setSelectedAsset: jest.fn(),
    data: {
      balances: [],
      statements: [],
      paymentMethods: [],
      bankAccounts: [
        {
          id: 'bank_account_1',
          type: 'bankAccount',
          attributes: {
            accountHolderName: 'JOHN DOE',
            accountNo: '0123456789',
            bank: 'DBS',
            status: 'verified',
          },
        },
      ],
    },
    refreshWallet,
    clearError: jest.fn(),
  };
}

describe('wallet UI API actions in sandbox mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
    fetchMock.mockReset();
    fetchMock.mockImplementation(() => mockJson({ data: [] }));
    setAppState();
  });

  test('settings test connection calls authorize hello in sandbox', async () => {
    fetchMock.mockImplementationOnce(() => mockJson({ msg: 'Hello world' }));
    const screen = render(<SettingsScreen />);

    fireEvent.press(screen.getByText('Test active key'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api-sandbox.straitsx.com/v1/authorize/hello',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  test('transfer in create bank details posts to sandbox virtual bank account endpoint', async () => {
    fetchMock.mockImplementationOnce(() =>
      mockJson({
        data: {
          id: 'vba_1',
          type: 'virtual_bank_account',
          attributes: {
            instructions: {
              bankShortCode: 'FAZZ',
              accountNo: '123456789',
              recipient_name: 'Xfers Pte Ltd',
            },
          },
        },
      }),
    );

    const screen = render(<TransferInScreen />);

    fireEvent.press(screen.getByText('Create bank details'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api-sandbox.straitsx.com/v1/payment_methods/virtual_bank_accounts',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  test('swap quote and execute actions call sandbox swap endpoints', async () => {
    fetchMock
      .mockImplementationOnce(() => mockJson({ data: [] }))
      .mockImplementationOnce(() =>
        mockJson({
          data: {
            id: 'quote_1',
            type: 'swapQuote',
            attributes: { rate: '0.75', targetCurrencyAmount: '7.50' },
          },
        }),
      )
      .mockImplementationOnce(() =>
        mockJson({
          data: {
            id: 'contract_1',
            type: 'swapTransaction',
            attributes: { status: 'pending' },
          },
        }),
      );

    const screen = render(<SwapScreen />);

    fireEvent.press(screen.getByText('Request quote'));
    await waitFor(() => expect(screen.getByText('Execute swap')).toBeTruthy());
    fireEvent.press(screen.getByText('Execute swap'));

    await waitFor(() => {
      const urls = fetchMock.mock.calls.map(([url]) => String(url));
      expect(urls).toContain('https://api-sandbox.straitsx.com/v1/swap/quotes');
      expect(urls).toContain('https://api-sandbox.straitsx.com/v1/swap/transactions');
    });
  });

  test('transfer out review and confirm posts sandbox withdrawal', async () => {
    fetchMock.mockImplementationOnce(() =>
      mockJson({
        data: {
          id: 'contract_1',
          type: 'withdrawal',
          attributes: { status: 'pending' },
        },
      }),
    );

    const screen = render(<TransferOutScreen />);

    fireEvent.press(screen.getByText('Review transfer'));
    await waitFor(() => expect(screen.getByText('Confirm')).toBeTruthy());
    fireEvent.press(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api-sandbox.straitsx.com/v1/withdrawals',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
