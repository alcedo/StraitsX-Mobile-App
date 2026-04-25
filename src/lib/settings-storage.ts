import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { StraitsXEnvironment } from './straitsx/client';

const SETTINGS_KEY = 'straitsx.mobile.settings.v1';

export type AppSettings = {
  activeEnvironment: StraitsXEnvironment;
  sandboxApiKey: string;
  productionApiKey: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  activeEnvironment: 'sandbox',
  sandboxApiKey: '',
  productionApiKey: '',
};

export async function loadSettings(): Promise<AppSettings> {
  const raw = await readValue(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings) {
  await writeValue(SETTINGS_KEY, JSON.stringify(settings));
}

export function getApiKey(settings: AppSettings) {
  return settings.activeEnvironment === 'sandbox' ? settings.sandboxApiKey : settings.productionApiKey;
}

async function readValue(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function writeValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}
