import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { defaultStatementWindow } from '@/src/lib/format';
import { AppSettings, DEFAULT_SETTINGS, getApiKey, loadSettings, saveSettings } from '@/src/lib/settings-storage';
import { getAccountBalances } from '@/src/lib/straitsx/balances';
import { StraitsXApiError, StraitsXClient } from '@/src/lib/straitsx/client';
import { getPaymentMethods } from '@/src/lib/straitsx/payments';
import { getAccountStatement } from '@/src/lib/straitsx/statements';
import { getBankAccounts } from '@/src/lib/straitsx/withdrawals';
import { Balance, BankAccount, PaymentMethod, StatementEntry } from '@/src/lib/straitsx/types';

type WalletData = {
  balances: Balance[];
  statements: StatementEntry[];
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
};

type AppStateContextValue = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => Promise<void>;
  client: StraitsXClient;
  hasApiKey: boolean;
  loadingSettings: boolean;
  refreshing: boolean;
  error: string | null;
  selectedAsset: string;
  setSelectedAsset: (asset: string) => void;
  data: WalletData;
  refreshWallet: () => Promise<void>;
  clearError: () => void;
};

const EMPTY_DATA: WalletData = {
  balances: [],
  statements: [],
  paymentMethods: [],
  bankAccounts: [],
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState('xsgd');
  const [data, setData] = useState<WalletData>(EMPTY_DATA);

  const apiKey = getApiKey(settings);
  const hasApiKey = apiKey.trim().length > 0;

  const client = useMemo(
    () =>
      new StraitsXClient({
        apiKey,
        environment: settings.activeEnvironment,
      }),
    [apiKey, settings.activeEnvironment],
  );

  useEffect(() => {
    let mounted = true;

    loadSettings()
      .then((stored) => {
        if (mounted) {
          setSettingsState(stored);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(toMessage(err));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingSettings(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setSettings = useCallback(async (nextSettings: AppSettings) => {
    setSettingsState(nextSettings);
    await saveSettings(nextSettings);
  }, []);

  const refreshWallet = useCallback(async () => {
    if (!hasApiKey) {
      setError('Add a sandbox API key in Settings to load wallet data.');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const balancesResponse = await getAccountBalances(client);
      const preferredCurrency =
        selectedAsset || balancesResponse.data[0]?.attributes.currency?.toLowerCase() || 'xsgd';
      const { from, to } = defaultStatementWindow();

      const [statementResponse, methodsResponse, bankAccountsResponse] = await Promise.all([
        getAccountStatement(client, { currency: preferredCurrency, from, to }),
        getPaymentMethods(client),
        getBankAccounts(client),
      ]);

      setData({
        balances: balancesResponse.data,
        statements: statementResponse.data,
        paymentMethods: methodsResponse.data,
        bankAccounts: bankAccountsResponse.data,
      });
    } catch (err) {
      setError(toMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [client, hasApiKey, selectedAsset]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      settings,
      setSettings,
      client,
      hasApiKey,
      loadingSettings,
      refreshing,
      error,
      selectedAsset,
      setSelectedAsset,
      data,
      refreshWallet,
      clearError: () => setError(null),
    }),
    [client, data, error, hasApiKey, loadingSettings, refreshWallet, refreshing, selectedAsset, setSettings, settings],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return value;
}

function toMessage(err: unknown) {
  if (err instanceof StraitsXApiError) {
    return err.code ? `${err.message} (${err.code})` : err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'Something went wrong.';
}
