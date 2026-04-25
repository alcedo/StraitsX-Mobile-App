import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, EmptyState, Pill, Row, Screen, palette } from '@/src/components/wallet-ui';
import { formatDate, formatMoney } from '@/src/lib/format';
import { useAppState } from '@/src/state/app-state';

export default function HomeScreen() {
  const { data, error, hasApiKey, refreshing, refreshWallet, selectedAsset, setSelectedAsset, settings } = useAppState();
  const primaryBalance =
    data.balances.find((balance) => balance.attributes.currency.toLowerCase() === selectedAsset) ?? data.balances[0];
  const totalLabel = primaryBalance
    ? formatMoney(primaryBalance.attributes.amount, primaryBalance.attributes.currency)
    : 'SGD 0.00';

  useEffect(() => {
    if (hasApiKey && data.balances.length === 0) {
      refreshWallet();
    }
  }, [data.balances.length, hasApiKey, refreshWallet]);

  return (
    <Screen
      title="StraitsX"
      action={
        <Link href="/profile" asChild>
          <Button variant="ghost" icon="account-circle">
            Profile
          </Button>
        </Link>
      }>
      <Card tone="dark">
        <View style={styles.balanceTop}>
          <Text style={styles.darkLabel}>Available balance</Text>
          <Pill tone={settings.activeEnvironment === 'sandbox' ? 'warning' : 'success'}>
            {settings.activeEnvironment.toUpperCase()}
          </Pill>
        </View>
        <Text style={styles.balance}>{totalLabel}</Text>
        <Text style={styles.darkDetail}>Regular account wallet balance from StraitsX merchant account APIs.</Text>
        <View style={styles.actions}>
          <Button icon="south-west" onPress={() => router.push('/transfer-in')}>
            In
          </Button>
          <Button icon="north-east" variant="secondary" onPress={() => router.push('/transfer-out')}>
            Out
          </Button>
          <Button icon="sync" variant="secondary" onPress={() => router.push('/(tabs)/swap')}>
            Swap
          </Button>
        </View>
      </Card>

      {error ? (
        <Card>
          <Row icon="error-outline" title="API status" detail={error} />
          <Button onPress={refreshWallet} loading={refreshing} variant="secondary">
            Retry
          </Button>
        </Card>
      ) : null}

      {!hasApiKey ? (
        <EmptyState title="Add your sandbox API key" detail="Settings stores sandbox and production keys separately. Sandbox is used by default." />
      ) : null}

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assets</Text>
          <Button onPress={refreshWallet} loading={refreshing} variant="ghost" icon="refresh">
            Refresh
          </Button>
        </View>
        {data.balances.length === 0 ? (
          <Text style={styles.muted}>Balances appear here after a successful API refresh.</Text>
        ) : (
          data.balances.map((balance) => {
            const currency = balance.attributes.currency.toLowerCase();
            return (
              <Row
                key={balance.id}
                icon="account-balance-wallet"
                title={currency.toUpperCase()}
                detail={currency === selectedAsset ? 'Selected asset' : 'Tap to inspect'}
                value={formatMoney(balance.attributes.amount, currency)}
                onPress={() => {
                  setSelectedAsset(currency);
                  router.push(`/asset/${currency}`);
                }}
              />
            );
          })
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        {data.statements.length === 0 ? (
          <Text style={styles.muted}>No account statement entries loaded yet.</Text>
        ) : (
          data.statements.slice(0, 5).map((entry) => (
            <Row
              key={entry.id}
              icon={entry.attributes.creditDebitIndicator === 'Credit' ? 'south-west' : 'north-east'}
              title={entry.attributes.type}
              detail={`${entry.attributes.status} · ${formatDate(entry.attributes.createdAt)}`}
              value={formatMoney(entry.attributes.amount, entry.attributes.currency)}
            />
          ))
        )}
      </Card>

      <Card tone="soft">
        <View style={styles.tip}>
          <MaterialIcons name="verified-user" size={22} color={palette.brand} />
          <Text style={styles.tipText}>Movement-of-funds actions use review screens and generated idempotency IDs before execution.</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  darkLabel: {
    color: '#B6C4C2',
    fontSize: 13,
    fontWeight: '700',
  },
  balance: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
  },
  darkDetail: {
    color: '#C9D7D5',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  muted: {
    color: palette.muted,
    lineHeight: 20,
  },
  tip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  tipText: {
    color: palette.ink,
    flex: 1,
    lineHeight: 20,
  },
});
