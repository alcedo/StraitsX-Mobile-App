import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, EmptyState, Field, Row, Screen, palette } from '@/src/components/wallet-ui';
import { defaultStatementWindow, formatDate, formatMoney } from '@/src/lib/format';
import { getAccountStatement } from '@/src/lib/straitsx/statements';
import { useAppState } from '@/src/state/app-state';

export default function HistoryScreen() {
  const { client, data, hasApiKey, selectedAsset } = useAppState();
  const [currency, setCurrency] = useState(selectedAsset);
  const [entries, setEntries] = useState(data.statements);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    setLoading(true);
    setError(null);

    try {
      const range = defaultStatementWindow();
      const response = await getAccountStatement(client, { currency, ...range });
      setEntries(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load history.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="History">
      <Card>
        <Field label="Currency" value={currency} onChangeText={(value) => setCurrency(value.toLowerCase())} />
        <Button disabled={!hasApiKey} loading={loading} onPress={loadHistory} icon="history">
          Load 30 days
        </Button>
      </Card>

      {entries.length === 0 ? (
        <EmptyState title="No transactions loaded" detail="Account statement entries appear here after a sandbox API refresh." />
      ) : (
        <Card>
          {entries.map((entry) => (
            <Row
              key={entry.id}
              icon={entry.attributes.creditDebitIndicator === 'Credit' ? 'south-west' : 'north-east'}
              title={entry.attributes.type}
              detail={`${entry.attributes.status} · ${formatDate(entry.attributes.createdAt)}`}
              value={formatMoney(entry.attributes.amount, entry.attributes.currency)}
            />
          ))}
        </Card>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: palette.coral,
    paddingHorizontal: 16,
  },
});
