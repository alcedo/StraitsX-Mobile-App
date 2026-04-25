<div align="center">

# StraitsX Mobile

**A polished React Native wallet for the StraitsX API — transfer, swap, and track balances across sandbox and production from your phone.**

[![Expo SDK](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Expo Router](https://img.shields.io/badge/Expo%20Router-6-000020?logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)
[![Jest](https://img.shields.io/badge/tested%20with-jest--expo-99425B?logo=jest&logoColor=white)](https://docs.expo.dev/develop/unit-testing/)
[![Platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-4c1)](#)
[![Status](https://img.shields.io/badge/status-active-success)](#)

</div>

---

## ✨ Overview

StraitsX Mobile is a wallet UI that sits on top of the [StraitsX](https://straitsx.com) API. It supports both **sandbox** and **production** environments and uses **API-key authentication** — there's no separate login flow. Keys are stored on-device with [`expo-secure-store`](https://docs.expo.dev/versions/latest/sdk/securestore/) and can be swapped from the in-app Settings screen.

The app is built with [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing), a typed StraitsX client in `src/lib/straitsx/`, and a context-based state layer.

## 🚀 Features

- 🏠 **Home dashboard** — balances across all supported assets at a glance
- 💎 **Asset details** — drill into a single currency for activity and metadata
- 📥 **Transfer In** — fund via PayNow or Virtual Bank Account (VBA)
- 📤 **Transfer Out** — withdraw to bank accounts or send on-chain
- 🔄 **Swap** — quote and execute currency conversions
- 📜 **History** — paginated transaction statements
- ⚙️ **Settings** — API keys, sandbox / production toggle, profile
- 🔐 **Secure key storage** — keys never leave the device unencrypted

## 🧱 Tech Stack

| Layer | Tool |
| --- | --- |
| Runtime | Expo SDK 54, React Native 0.81, React 19 |
| Routing | `expo-router` 6 (file-based) |
| Navigation | `@react-navigation/bottom-tabs` 7 |
| State | React Context (`src/state/app-state.tsx`) |
| Secure Storage | `expo-secure-store` |
| Animations | `react-native-reanimated` 4 |
| Icons | `@expo/vector-icons`, `expo-symbols` |
| Testing | `jest-expo`, `@testing-library/react-native` |
| Lint | `eslint` + `eslint-config-expo` |
| Language | TypeScript 5.9 (strict) |

## 📁 Project Structure

```
StraitsxMobile/
├── app/                       # Expo Router screens (file-based routes)
│   ├── (tabs)/                # Bottom-tab screens: home, transfer, swap, history, settings
│   ├── asset/[currency].tsx   # Dynamic asset detail
│   ├── transfer-in.tsx        # PayNow / VBA funding flow
│   ├── transfer-out.tsx       # Bank + on-chain withdrawal flow
│   ├── profile.tsx            # Profile / account info
│   ├── modal.tsx              # Shared modal route
│   └── _layout.tsx            # Root layout (AppStateProvider + theme)
├── src/
│   ├── lib/straitsx/          # Typed API client (auth, balances, payments, swaps, …)
│   ├── state/app-state.tsx    # App state context (env, keys, cache)
│   ├── components/            # Reusable wallet UI
│   └── lib/                   # format, settings-storage helpers
├── __tests__/                 # Jest tests (services + UI actions)
├── components/                # Shared low-level RN components
├── constants/                 # Theme + config constants
├── hooks/                     # Reusable hooks
├── assets/                    # Images, fonts
├── PRD.md                     # Product spec
└── package.json
```

## 🏁 Getting Started

### Prerequisites

- **Node.js** 20+ and **npm**
- **Expo Go** on your device, or an iOS simulator / Android emulator

### Install & run

```bash
npm install
npm start
```

From the Expo dev server you can launch on any platform:

```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web preview
```

## 🔑 Configuration

No `.env` file is needed. On first launch:

1. Open the **Settings** tab.
2. Paste your **sandbox** and/or **production** StraitsX API keys.
3. Toggle the active environment from the same screen.

Keys are persisted with `expo-secure-store` and read via the helpers in `src/lib/settings-storage.ts`.

## 🧪 Testing

```bash
npm test
```

Runs Jest with the `jest-expo` preset (`--runInBand` for deterministic order). Coverage:

- `__tests__/straitsx-services-test.ts` — API client behavior
- `__tests__/wallet-ui-actions-test.tsx` — UI action flows

`expo-secure-store` is mocked with an in-memory map in `jest.setup.ts` so tests don't touch the keychain.

## 🧹 Linting & Type Checking

```bash
npm run lint
```

TypeScript runs in strict mode. The `@/*` path alias (configured in `tsconfig.json`) resolves to the project root, so prefer `@/src/lib/...` over deep relative imports.

## 📜 Available Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` | Open in the iOS simulator |
| `npm run android` | Open in the Android emulator |
| `npm run web` | Open in the browser |
| `npm run lint` | Run `expo lint` (ESLint) |
| `npm test` | Run the Jest test suite |
| `npm run reset-project` | Reset back to a blank Expo template |

## 🗺️ App Routes

| Route | Purpose |
| --- | --- |
| `/` *(tabs → index)* | Home / balance dashboard |
| `/transfer` *(tabs)* | Transfer flow selector |
| `/swap` *(tabs)* | Swap quotes & execution |
| `/history` *(tabs)* | Transaction history |
| `/settings` *(tabs)* | API keys & environment toggle |
| `/asset/[currency]` | Asset detail view |
| `/transfer-in` | PayNow / VBA funding |
| `/transfer-out` | Bank withdrawal & blockchain send |
| `/profile` | Profile / account info |
| `/modal` | Shared modal route |

## 📄 Further Reading

- [`PRD.md`](./PRD.md) — full product spec for this app
- [Expo Router docs](https://docs.expo.dev/router/introduction/)
- [StraitsX API](https://docs.straitsx.com/)
