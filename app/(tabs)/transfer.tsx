import { router } from 'expo-router';
import { Text } from 'react-native';

import { Card, Row, Screen, palette } from '@/src/components/wallet-ui';
import { useAppState } from '@/src/state/app-state';

export default function TransferScreen() {
  const { data } = useAppState();
  const verifiedAccounts = data.bankAccounts.filter((account) => account.attributes.status === 'verified').length;

  return (
    <Screen title="Transfer">
      <Card>
        <Row
          icon="south-west"
          title="Transfer in"
          detail="Create virtual bank account details, persistent PayNow, or dynamic PayNow QR."
          onPress={() => router.push('/transfer-in')}
        />
        <Row
          icon="north-east"
          title="Transfer out"
          detail="Send funds to a verified bank account or whitelisted blockchain address."
          onPress={() => router.push('/transfer-out')}
        />
      </Card>

      <Card tone="soft">
        <Text style={{ color: palette.ink, fontWeight: '800', fontSize: 18 }}>Destinations</Text>
        <Text style={{ color: palette.muted, lineHeight: 20 }}>
          {verifiedAccounts} verified bank account{verifiedAccounts === 1 ? '' : 's'} loaded from the regular account withdrawal APIs.
        </Text>
      </Card>
    </Screen>
  );
}
