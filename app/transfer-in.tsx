import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Field, Row, Screen, palette } from '@/src/components/wallet-ui';
import { createIdempotencyId } from '@/src/lib/straitsx/client';
import {
  createDynamicPayNow,
  createPersistentPayNow,
  createVirtualBankAccount,
} from '@/src/lib/straitsx/payments';
import { PaymentMethod, TransactionResource } from '@/src/lib/straitsx/types';
import { useAppState } from '@/src/state/app-state';

type Method = 'bank' | 'persistent-paynow' | 'dynamic-paynow';

export default function TransferInScreen() {
  const { client, hasApiKey, refreshWallet } = useAppState();
  const [method, setMethod] = useState<Method>('bank');
  const [amount, setAmount] = useState('10.00');
  const [reference, setReference] = useState(createIdempotencyId('deposit'));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PaymentMethod | TransactionResource | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createDepositInstruction() {
    setLoading(true);
    setError(null);

    try {
      if (method === 'bank') {
        const response = await createVirtualBankAccount(client, {
          referenceId: reference,
          currency: 'SGD',
          network: 'fast',
          bankShortCode: 'FAZZ',
        });
        setResult(response.data);
      } else if (method === 'persistent-paynow') {
        const response = await createPersistentPayNow(client, { referenceId: reference });
        setResult(response.data);
      } else {
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const response = await createDynamicPayNow(client, {
          referenceId: reference,
          amount: Number(amount),
          expiresAt,
        });
        setResult(response.data);
      }

      await refreshWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create transfer-in instructions.');
    } finally {
      setLoading(false);
    }
  }

  const qr = result?.attributes?.paymentMethod && typeof result.attributes.paymentMethod === 'object'
    ? (result.attributes.paymentMethod as { base64EncodedImage?: string }).base64EncodedImage
    : undefined;
  const instructions = result?.attributes?.instructions as
    | { bankShortCode?: string; accountNo?: string; recipient_name?: string; bank_payee_name?: string }
    | undefined;

  return (
    <Screen title="Transfer in" action={<Button variant="ghost" icon="arrow-back" onPress={() => router.back()}>Back</Button>}>
      <Card>
        <Row icon="account-balance" title="Bank transfer" detail="Create SGD virtual bank account details." onPress={() => setMethod('bank')} />
        <Row icon="qr-code-2" title="Persistent PayNow" detail="Create reusable PayNow collection details." onPress={() => setMethod('persistent-paynow')} />
        <Row icon="timer" title="Dynamic PayNow" detail="Create a fixed amount QR that expires." onPress={() => setMethod('dynamic-paynow')} />
      </Card>

      <Card>
        <Text style={styles.heading}>Create instruction</Text>
        <Field label="Reference ID" value={reference} onChangeText={setReference} />
        {method === 'dynamic-paynow' ? (
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        ) : null}
        <Button disabled={!hasApiKey} loading={loading} onPress={createDepositInstruction} icon="add">
          Create {method === 'bank' ? 'bank details' : 'PayNow'}
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
          {qr ? <Image source={{ uri: `data:image/png;base64,${qr}` }} style={styles.qr} /> : null}
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
  qr: {
    alignSelf: 'center',
    height: 180,
    width: 180,
  },
});
