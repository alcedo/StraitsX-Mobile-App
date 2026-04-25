import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Field, Row, Screen, palette } from '@/src/components/wallet-ui';
import { createIdempotencyId } from '@/src/lib/straitsx/client';
import { createSwapQuote, executeSwap, getSwapPairs } from '@/src/lib/straitsx/swaps';
import { SwapPair, SwapQuote, TransactionResource } from '@/src/lib/straitsx/types';
import { useAppState } from '@/src/state/app-state';

export default function SwapScreen() {
  const { client, hasApiKey, refreshWallet } = useAppState();
  const [pairs, setPairs] = useState<SwapPair[]>([]);
  const [swapPair, setSwapPair] = useState('XSGDUSDC');
  const [sourceCurrency, setSourceCurrency] = useState('XSGD');
  const [targetCurrency, setTargetCurrency] = useState('USDC');
  const [amount, setAmount] = useState('10.00');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [transaction, setTransaction] = useState<TransactionResource | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasApiKey) {
      return;
    }

    getSwapPairs(client)
      .then((response) => setPairs(response.data))
      .catch(() => undefined);
  }, [client, hasApiKey]);

  async function requestQuote() {
    setLoading(true);
    setError(null);
    setTransaction(null);

    try {
      const response = await createSwapQuote(client, {
        swapPair,
        sourceCurrency,
        targetCurrency,
        fixedSide: 'source',
        amount,
      });
      setQuote(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request quote.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmSwap() {
    if (!quote) {
      return;
    }

    setExecuting(true);
    setError(null);

    try {
      const response = await executeSwap(client, {
        idempotencyId: createIdempotencyId('swap'),
        quoteId: quote.id,
      });
      setTransaction(response.data);
      await refreshWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to execute swap.');
    } finally {
      setExecuting(false);
    }
  }

  return (
    <Screen title="Swap">
      <Card>
        <Text style={styles.heading}>Quote</Text>
        <Field label="Swap pair" value={swapPair} onChangeText={(value) => setSwapPair(value.toUpperCase())} />
        <View style={styles.twoCol}>
          <Field label="From" value={sourceCurrency} onChangeText={(value) => setSourceCurrency(value.toUpperCase())} />
          <Field label="To" value={targetCurrency} onChangeText={(value) => setTargetCurrency(value.toUpperCase())} />
        </View>
        <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <Button disabled={!hasApiKey} loading={loading} onPress={requestQuote} icon="request-quote">
          Request quote
        </Button>
      </Card>

      {pairs.length > 0 ? (
        <Card>
          <Text style={styles.heading}>Supported pairs</Text>
          {pairs.slice(0, 8).map((pair) => (
            <Row
              key={pair.id}
              icon="sync"
              title={pair.attributes.code}
              value={pair.attributes.code === swapPair ? 'Selected' : undefined}
              onPress={() => {
                setSwapPair(pair.attributes.code);
                const [source, target] = splitPair(pair.attributes.code);
                setSourceCurrency(source);
                setTargetCurrency(target);
              }}
            />
          ))}
        </Card>
      ) : null}

      {quote ? (
        <Card tone="soft">
          <Text style={styles.heading}>Review quote</Text>
          <Text style={styles.muted}>Quote ID: {quote.id}</Text>
          <Text style={styles.muted}>Rate: {String(quote.attributes.rate ?? 'Pending')}</Text>
          <Text style={styles.muted}>
            Receive: {String(quote.attributes.targetCurrencyAmount ?? amount)} {targetCurrency}
          </Text>
          <Button loading={executing} onPress={confirmSwap} icon="check">
            Execute swap
          </Button>
        </Card>
      ) : null}

      {transaction ? (
        <Card>
          <Text style={styles.heading}>Swap submitted</Text>
          <Text style={styles.muted}>{transaction.id} · {String(transaction.attributes.status ?? 'pending')}</Text>
        </Card>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

function splitPair(code: string) {
  const known = ['XSGD', 'XUSD', 'USDC', 'USDT', 'SGD', 'USD'];
  const source = known.find((currency) => code.startsWith(currency)) ?? code.slice(0, 4);
  return [source, code.slice(source.length)] as const;
}

const styles = StyleSheet.create({
  heading: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  muted: {
    color: palette.muted,
    lineHeight: 20,
  },
  error: {
    color: palette.coral,
    paddingHorizontal: 16,
  },
});
