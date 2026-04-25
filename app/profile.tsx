import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Row, Screen, palette } from '@/src/components/wallet-ui';
import { useAppState } from '@/src/state/app-state';

export default function ProfileScreen() {
  const { data, settings } = useAppState();

  return (
    <Screen title="Profile" action={<Button variant="ghost" icon="arrow-back" onPress={() => router.back()}>Back</Button>}>
      <Card tone="soft">
        <Text style={styles.heading}>Regular account</Text>
        <Text style={styles.muted}>This app uses StraitsX business-account APIs directly. Customer profile APIs are intentionally excluded.</Text>
      </Card>

      <Card>
        <Row icon="science" title="Environment" value={settings.activeEnvironment} />
        <Row icon="account-balance-wallet" title="Assets loaded" value={String(data.balances.length)} />
        <Row icon="account-balance" title="Bank accounts" value={String(data.bankAccounts.length)} />
        <Row icon="receipt-long" title="Statement entries" value={String(data.statements.length)} />
      </Card>
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
});
