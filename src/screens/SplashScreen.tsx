import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface SplashScreenProps {
  onFinish: (authenticated: boolean) => void;
  checkAuth: () => Promise<boolean>;
}

export function SplashScreen({ onFinish, checkAuth }: SplashScreenProps) {
  useEffect(() => {
    let cancelled = false;
    checkAuth().then(authenticated => {
      if (!cancelled) {
        onFinish(authenticated);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [checkAuth, onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyApp</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
      <Text style={styles.subtitle}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  spinner: {
    marginTop: 24,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
