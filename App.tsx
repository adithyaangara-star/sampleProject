/**
 * Auth flow: Splash → Login | Dashboard
 * Persists tokens in AsyncStorage, uses interceptors for token refresh and force logout.
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const { authState, isAuthenticated, checkStoredAuth } = useAuth();

  if (!splashDone) {
    return (
      <SplashScreen
        checkAuth={checkStoredAuth}
        onFinish={() => setSplashDone(true)}
      />
    );
  }

  if (authState === 'loading') {
    return null;
  }

  if (isAuthenticated) {
    return <DashboardScreen />;
  }

  return <LoginScreen />;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
