import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Field, Screen, palette } from '@/src/components/wallet-ui';
import { createIdempotencyId } from '@/src/lib/straitsx/client';
import { createVirtualBankAccount } from '@/src/lib/straitsx/payments';
import { PaymentMethod } from '@/src/lib/straitsx/types';
import { useAppState } from '@/src/state/app-state';

export default function TransferInScreen() {
  const { client, hasApiKey, refreshWallet } = useAppState();
  const [reference, setReference] = useState(createIdempotencyId('deposit'));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createDepositInstruction() {
    setLoading(true);
    setError(null);

    try {
      const response = await createVirtualBankAccount(client, {
        referenceId: reference,
        currency: 'SGD',
        network: 'fast',
        bankShortCode: 'FAZZ',
      });
      setResult(response.data);
      await refreshWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create transfer-in instructions.');
    } finally {
      setLoading(false);
    }
  }

  const instructions = result?.attributes?.instructions as
    | { bankShortCode?: string; accountNo?: string; recipient_name?: string; bank_payee_name?: string }
    | undefined;

  return (
    <Screen title="Transfer in" action={<Button variant="ghost" icon="arrow-back" onPress={() => router.back()}>Back</Button>}>
      <Card>
        <Text style={styles.heading}>Create bank details</Text>
        <Field label="Reference ID" value={reference} onChangeText={setReference} />
        <Button disabled={!hasApiKey} loading={loading} onPress={createDepositInstruction} icon="add">
          Create bank details
        </Button>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      {result ? (
        <Card tone="soft">
          <Text style={styles.heading}>Instruction ready</Text>
          <Text style={styles.muted}>ID: {result.id}</Text>
          {instructions ? (
            <View style={styles.instructions}>
              <Text style={styles.value}>Bank: {instructions.bankShortCode}</Text>
              <Text style={styles.value}>Account: {instructions.accountNo}</Text>
              <Text style={styles.value}>Recipient: {instructions.recipient_name ?? instructions.bank_payee_name}</Text>
            </View>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  muted: {
    color: palette.muted,
    lineHeight: 20,
  },
  error: {
    color: palette.coral,
    lineHeight: 20,
  },
  instructions: {
    gap: 6,
  },
  value: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
});
