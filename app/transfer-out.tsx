import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Field, Row, Screen, palette } from '@/src/components/wallet-ui';
import { createIdempotencyId } from '@/src/lib/straitsx/client';
import { getBlockchainAddresses, createBlockchainWithdrawal } from '@/src/lib/straitsx/blockchain';
import { BlockchainAddress, TransactionResource } from '@/src/lib/straitsx/types';
import { createWithdrawal } from '@/src/lib/straitsx/withdrawals';
import { useAppState } from '@/src/state/app-state';

type DestinationType = 'bank' | 'blockchain';

export default function TransferOutScreen() {
  const { client, data, hasApiKey, refreshWallet, selectedAsset } = useAppState();
  const [destinationType, setDestinationType] = useState<DestinationType>('bank');
  const [amount, setAmount] = useState('10.00');
  const [walletSource, setWalletSource] = useState(selectedAsset as 'sgd' | 'usd' | 'xsgd' | 'xusd');
  const [bankAccountId, setBankAccountId] = useState('');
  const [blockchainAddresses, setBlockchainAddresses] = useState<BlockchainAddress[]>([]);
  const [addressId, setAddressId] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransactionResource | TransactionResource[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data.bankAccounts[0] && !bankAccountId) {
      setBankAccountId(data.bankAccounts[0].id);
    }
  }, [bankAccountId, data.bankAccounts]);

  async function loadBlockchainAddresses() {
    setError(null);
    try {
      const response = await getBlockchainAddresses(client);
      setBlockchainAddresses(response);
      if (response[0]?.data.id) {
        setAddressId(response[0].data.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load blockchain addresses.');
    }
  }

  async function confirmTransfer() {
    setLoading(true);
    setError(null);

    try {
      if (destinationType === 'bank') {
        const response = await createWithdrawal(client, {
          idempotencyId: createIdempotencyId('withdrawal'),
          bankAccountId,
          amount,
          network: walletSource === 'usd' || walletSource === 'xusd' ? 'swift' : 'fast',
          walletSource,
        });
        setResult(response.data);
      } else {
        const response = await createBlockchainWithdrawal(client, {
          address_id: addressId,
          amount: Number(amount),
          idempotency_id: createIdempotencyId('chain'),
          wallet_source: walletSource,
        });
        setResult(response);
      }

      setReviewing(false);
      await refreshWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create transfer.');
    } finally {
      setLoading(false);
    }
  }

  const canReview = hasApiKey && Number(amount) > 0 && (destinationType === 'bank' ? bankAccountId : addressId);

  return (
    <Screen title="Transfer out" action={<Button variant="ghost" icon="arrow-back" onPress={() => router.back()}>Back</Button>}>
      <Card>
        <Row icon="account-balance" title="Bank account" detail="Withdraw to a verified StraitsX bank account." onPress={() => setDestinationType('bank')} />
        <Row
          icon="token"
          title="Blockchain address"
          detail="Withdraw stablecoins to a verified blockchain address."
          onPress={() => {
            setDestinationType('blockchain');
            loadBlockchainAddresses();
          }}
        />
      </Card>

      <Card>
        <Text style={styles.heading}>Compose</Text>
        <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <Field label="Wallet source" value={walletSource} onChangeText={(value) => setWalletSource(value.toLowerCase() as typeof walletSource)} />
        {destinationType === 'bank' ? (
          <>
            {data.bankAccounts.map((account) => {
              const { accountHolderName, accountNo, bank, swiftBic, status } = account.attributes;
              const bankLabel = [bank, swiftBic].filter(Boolean).join(' · ') || 'Unknown bank';
              return (
                <Row
                  key={account.id}
                  icon="account-balance"
                  title={accountHolderName || 'Unnamed'}
                  detail={`${bankLabel} · ${accountNo} · ${status}`}
                  value={account.id === bankAccountId ? 'Selected' : undefined}
                  onPress={() => setBankAccountId(account.id)}
                />
              );
            })}
            {data.bankAccounts.length === 0 ? <Text style={styles.muted}>No bank accounts loaded. Refresh Home after adding an API key.</Text> : null}
          </>
        ) : (
          <>
            {blockchainAddresses.map((address) => (
              <Row
                key={address.data.id}
                icon="token"
                title={address.data.attributes.address_label}
                detail={`${address.data.attributes.token.toUpperCase()} · ${address.data.attributes.network} · ${address.data.attributes.verification_status}`}
                value={address.data.id === addressId ? 'Selected' : undefined}
                onPress={() => setAddressId(address.data.id)}
              />
            ))}
            {blockchainAddresses.length === 0 ? <Button variant="secondary" onPress={loadBlockchainAddresses}>Load addresses</Button> : null}
          </>
        )}
        <Button disabled={!canReview} onPress={() => setReviewing(true)} icon="fact-check">
          Review transfer
        </Button>
      </Card>

      {reviewing ? (
        <Card tone="soft">
          <Text style={styles.heading}>Review</Text>
          {destinationType === 'bank' ? (
            <>
              {(() => {
                const account = data.bankAccounts.find((a) => a.id === bankAccountId);
                if (!account) return <Text style={styles.muted}>Bank account: {bankAccountId}</Text>;
                const { accountHolderName, accountNo, bank, swiftBic } = account.attributes;
                return (
                  <>
                    <Text style={styles.muted}>Holder: {accountHolderName || 'N/A'}</Text>
                    <Text style={styles.muted}>Account: {accountNo}</Text>
                    <Text style={styles.muted}>Bank: {[bank, swiftBic].filter(Boolean).join(' · ') || 'N/A'}</Text>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              {(() => {
                const addr = blockchainAddresses.find((a) => a.data.id === addressId);
                if (!addr) return <Text style={styles.muted}>Address: {addressId}</Text>;
                const { address_label, blockchain_address, token, network } = addr.data.attributes;
                return (
                  <>
                    <Text style={styles.muted}>Label: {address_label}</Text>
                    <Text style={styles.muted}>Address: {blockchain_address}</Text>
                    <Text style={styles.muted}>Token: {token.toUpperCase()} · {network}</Text>
                  </>
                );
              })()}
            </>
          )}
          <Text style={styles.muted}>Amount: {walletSource.toUpperCase()} {amount}</Text>
          <View style={styles.actions}>
            <Button loading={loading} onPress={confirmTransfer} icon="check">
              Confirm
            </Button>
            <Button variant="ghost" onPress={() => setReviewing(false)}>
              Cancel
            </Button>
          </View>
        </Card>
      ) : null}

      {result ? (
        <Card>
          <Text style={styles.heading}>Transfer submitted</Text>
          <Text style={styles.muted}>{Array.isArray(result) ? result[0]?.id ?? 'Blockchain withdrawal created' : result.id}</Text>
        </Card>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
