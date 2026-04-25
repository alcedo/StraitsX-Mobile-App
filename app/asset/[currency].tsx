import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Row, Screen, palette } from '@/src/components/wallet-ui';
import { formatDate, formatMoney } from '@/src/lib/format';
import { useAppState } from '@/src/state/app-state';

export default function AssetScreen() {
  const { currency } = useLocalSearchParams<{ currency: string }>();
  const { data } = useAppState();
  const asset = (currency ?? 'xsgd').toLowerCase();
  const balance = data.balances.find((item) => item.attributes.currency.toLowerCase() === asset);
  const entries = data.statements.filter((entry) => entry.attributes.currency.toLowerCase() === asset);

  return (
    <Screen title={asset.toUpperCase()} action={<Button variant="ghost" icon="arrow-back" onPress={() => router.back()}>Back</Button>}>
      <Card tone="dark">
        <Text style={styles.label}>Available</Text>
        <Text style={styles.balance}>{formatMoney(balance?.attributes.amount, asset)}</Text>
      </Card>

      <Card>
        <Text style={styles.heading}>Activity</Text>
        {entries.length === 0 ? (
          <Text style={styles.muted}>Refresh account statement data from Home or History.</Text>
        ) : (
          entries.map((entry) => (
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#B6C4C2',
    fontWeight: '700',
  },
  balance: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  heading: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  muted: {
    color: palette.muted,
    lineHeight: 20,
  },
});
