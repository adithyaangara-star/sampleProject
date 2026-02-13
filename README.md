# MyApp

React Native app with login flow, token-based auth (access + refresh), splash screen, and dashboard. Uses AsyncStorage for persistence and Axios interceptors for token refresh and force logout.

## Features

- **Login / Logout** with email and password validation
- **Splash screen** — checks stored auth and expiry (works offline)
- **Dashboard** — static overview and recent activity; logout button
- **Token refresh** — on 401, refresh token is used to get a new access token; force logout if refresh fails
- **Persistence** — tokens stored in AsyncStorage (offline-safe)

## Login (Mock API)

The app uses a mock login API. Use the following credentials to sign in:

| Field    | Acceptable value      |
|---------|------------------------|
| **Email**    | `test@example.com`    |
| **Password** | `password123`         |

- **Email**: valid format required; this is the accepted test email.
- **Password**: minimum 6 characters; this is the accepted test password.

## Setup

```bash
npm install
```

### Android

```bash
npm run android
```

### iOS

```bash
bundle install
bundle exec pod install
npm run ios
```

## Run

```bash
npm start
```

Then run the app on a device or simulator (see above).

## Project structure

- `App.tsx` — auth flow: Splash → Login | Dashboard
- `src/api/` — auth client (interceptors), login/refresh API
- `src/contexts/` — AuthContext
- `src/screens/` — SplashScreen, LoginScreen, DashboardScreen
- `src/storage/` — AsyncStorage helpers for tokens
- `src/utils/` — email/password validation

## Ignored files

`node_modules/` and other build/tooling artifacts are ignored via `.gitignore` (see `.gitignore` in the repo).
