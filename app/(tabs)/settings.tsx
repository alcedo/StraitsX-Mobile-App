import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Button, Card, Field, Pill, Row, Screen, palette } from '@/src/components/wallet-ui';
import { getAccountBalances } from '@/src/lib/straitsx/balances';
import { StraitsXClient } from '@/src/lib/straitsx/client';
import { Balance } from '@/src/lib/straitsx/types';
import { useAppState } from '@/src/state/app-state';

export default function SettingsScreen() {
  const { settings, setSettings } = useAppState();
  const [sandboxApiKey, setSandboxApiKey] = useState(settings.sandboxApiKey);
  const [productionApiKey, setProductionApiKey] = useState(settings.productionApiKey);
  const [activeEnvironment, setActiveEnvironment] = useState(settings.activeEnvironment);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);

  useEffect(() => {
    setSandboxApiKey(settings.sandboxApiKey);
    setProductionApiKey(settings.productionApiKey);
    setActiveEnvironment(settings.activeEnvironment);
  }, [settings]);

  async function persist() {
    await setSettings({
      activeEnvironment,
      sandboxApiKey,
      productionApiKey,
    });
    setStatus('Settings saved.');
  }

  async function testConnection() {
    setTesting(true);
    setStatus(null);
    setBalances([]);

    try {
      const apiKey = activeEnvironment === 'sandbox' ? sandboxApiKey : productionApiKey;
      const client = new StraitsXClient({ apiKey, environment: activeEnvironment });
      const response = await getAccountBalances(client);
      setBalances(response.data);
      setStatus(`Key valid — ${response.data.length} asset(s) found.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setTesting(false);
    }
  }

  const isProduction = activeEnvironment === 'production';

  return (
    <Screen title="Settings">
      <Card>
        <View style={styles.environmentRow}>
          <View>
            <Text style={styles.heading}>Environment</Text>
            <Text style={styles.muted}>{activeEnvironment === 'sandbox' ? 'Sandbox mode' : 'Production mode'}</Text>
          </View>
          <Pill tone={isProduction ? 'success' : 'warning'}>{activeEnvironment.toUpperCase()}</Pill>
          <Switch
            value={isProduction}
            onValueChange={(value) => setActiveEnvironment(value ? 'production' : 'sandbox')}
            trackColor={{ false: '#F3C96B', true: palette.brandSoft }}
            thumbColor={isProduction ? palette.brand : palette.gold}
          />
        </View>
        <Row icon="science" title="Default testing mode" detail="Automated tests and API-call tests use sandbox only." />
      </Card>

      <Card>
        <Field
          label="Sandbox API key"
          value={sandboxApiKey}
          onChangeText={setSandboxApiKey}
          placeholder="X-XFERS sandbox key"
          secureTextEntry
        />
        <Field
          label="Production API key"
          value={productionApiKey}
          onChangeText={setProductionApiKey}
          placeholder="X-XFERS production key"
          secureTextEntry
        />
        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <Button onPress={persist} icon="save">
              Save settings
            </Button>
          </View>
          <View style={styles.actionButton}>
            <Button variant="secondary" loading={testing} onPress={testConnection} icon="wifi-tethering">
              Test active key
            </Button>
          </View>
        </View>
      </Card>

      {status ? (
        <Card tone={balances.length > 0 ? 'soft' : 'surface'}>
          <View style={styles.statusRow}>
            <MaterialIcons
              name={balances.length > 0 ? 'check-circle' : 'info-outline'}
              size={22}
              color={balances.length > 0 ? palette.brand : palette.muted}
            />
            <View style={styles.statusText}>
              <Text style={styles.heading}>Status</Text>
              <Text style={styles.muted}>{status}</Text>
            </View>
          </View>
        </Card>
      ) : null}

      {balances.length > 0 ? (
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.heading}>Balances</Text>
            <Text style={styles.assetCount}>{balances.length} assets</Text>
          </View>
          <View style={styles.balanceGrid}>
            {balances.map((balance) => {
              const currency = balance.attributes.currency.toLowerCase();

              return (
                <View key={balance.id} style={styles.balanceTile}>
                  <View style={styles.balanceIcon}>
                    <MaterialIcons name="account-balance-wallet" size={18} color={palette.brand} />
                  </View>
                  <Text style={styles.balanceCurrency}>{currency.toUpperCase()}</Text>
                  <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>
                    {`${balance.attributes.amount} ${currency.toUpperCase()}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  environmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assetCount: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  balanceTile: {
    backgroundColor: '#F8FAFB',
    borderColor: palette.line,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexBasis: '48%',
    flexGrow: 1,
    gap: 6,
    minHeight: 118,
    padding: 12,
  },
  balanceIcon: {
    alignItems: 'center',
    backgroundColor: palette.brandSoft,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  balanceCurrency: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  balanceAmount: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
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
