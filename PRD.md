# StraitsX Expo Mobile App Plan

## Summary
Build the existing `StraitsxMobile` Expo Router app into a production-capable StraitsX regular-account wallet UI, defaulting to sandbox with a Settings toggle for production. The app will use API-key-only auth, with separate sandbox and production keys stored locally, and no login or customer-profile APIs.

## Key Changes
- Replace starter tabs with wallet screens matching the reference flow: Home, Asset Detail, Transfer In, Transfer Out, Swap, History, Profile, and Settings.
- Add an API layer for the current OpenAPI spec:
  - Auth test: `GET /authorize/hello`
  - Balances: `GET /merchant/account-balance`
  - History: `GET /merchant/statements/account-statement`, plus payments/swap/withdrawal lists where useful
  - Transfer in: `POST /payment_methods/virtual_bank_accounts`, `POST /payment_methods/paynow`, `POST /payments/paynow`, and matching GET detail calls
  - Transfer out: `GET/POST /withdrawals/bank-accounts`, `POST /withdrawals`, `GET /withdrawals/{withdrawal_id}`, blockchain address/fee/withdrawal endpoints
  - Swap: `GET /swap/pairs`, `POST /swap/quotes`, `POST /swap/transactions`, transaction status GETs
- Exclude all customer-profile APIs, including `/kyc/customer_profiles` and `/customer_profile/{customer_profile_id}/...`.
- Store keys with `expo-secure-store` on native and a web-safe local storage fallback for browser use.
- Use generated idempotency IDs for mutating transaction calls and require review/confirm screens before withdrawals, blockchain sends, and swap execution.

## Interfaces
- Add `src/lib/straitsx/client.ts` with typed helpers: environment base URL, API-key header injection, query serialization, JSON error normalization, and `StraitsXApiError`.
- Add service modules for `auth`, `balances`, `payments`, `withdrawals`, `blockchain`, `swaps`, and `statements`.
- Add app state for active environment, saved keys, connection status, selected asset, and cached API results.
- Add `test` setup with `jest-expo` and React Native Testing Library, following Expo’s official Jest guidance.

## Test Plan
- Unit test each API service with mocked `fetch`: correct method, URL, headers, request body, success parsing, and StraitsX error parsing.
- Test Settings persistence: separate sandbox/production keys, default sandbox, environment switching, and missing-key blocking.
- Test UI action wiring: auth test button, refresh balances/history, create PayNow/VBA, quote/execute swap, create withdrawal, and status polling.
- Run `npm run lint`, `npm run test`, and start Expo web/native dev server for manual smoke testing.

## Assumptions
- The term “regular user POV” means StraitsX regular/business-account APIs only, not customer profiles.
- Sandbox is the default environment; production is available through an explicit Settings toggle.
- The reference HTML is visual/flow guidance only, because its linked JSX/token files are not present in the repo.
- Current Expo docs used: [llms.txt](https://docs.expo.dev/llms.txt), [Jest testing](https://docs.expo.dev/develop/unit-testing/), and [local data storage](https://docs.expo.dev/develop/user-interface/store-data/).

