import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Button, Card, Field, Row, Screen, palette } from '@/src/components/wallet-ui';
import { sayHello } from '@/src/lib/straitsx/auth';
import { StraitsXClient } from '@/src/lib/straitsx/client';
import { useAppState } from '@/src/state/app-state';

export default function SettingsScreen() {
  const { settings, setSettings } = useAppState();
  const [sandboxApiKey, setSandboxApiKey] = useState(settings.sandboxApiKey);
  const [productionApiKey, setProductionApiKey] = useState(settings.productionApiKey);
  const [activeEnvironment, setActiveEnvironment] = useState(settings.activeEnvironment);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

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

    try {
      const apiKey = activeEnvironment === 'sandbox' ? sandboxApiKey : productionApiKey;
      const client = new StraitsXClient({ apiKey, environment: activeEnvironment });
      const response = await sayHello(client);
      setStatus(response.msg);
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
        <Button onPress={persist} icon="save">
          Save settings
        </Button>
        <Button variant="secondary" loading={testing} onPress={testConnection} icon="wifi-tethering">
          Test active key
        </Button>
      </Card>

      {status ? (
        <Card tone="soft">
          <Text style={styles.heading}>Status</Text>
          <Text style={styles.muted}>{status}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  environmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
