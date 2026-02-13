import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const STATS = [
  { label: 'Total users', value: '12,847', change: '+12%' },
  { label: 'Revenue', value: '$48,290', change: '+8%' },
  { label: 'Active sessions', value: '3,421', change: '-2%' },
];

const ACTIVITIES = [
  { id: '1', action: 'New signup', detail: 'user@example.com', time: '2 min ago' },
  { id: '2', action: 'Payment received', detail: '$129.00', time: '15 min ago' },
  { id: '3', action: 'Support ticket', detail: '#4521', time: '1 hr ago' },
  { id: '4', action: 'Deployment', detail: 'v2.1.0', time: '2 hrs ago' },
];

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const stats = useMemo(
    () =>
      STATS.map(s => ({
        ...s,
        value: s.value,
        positive: s.change.startsWith('+'),
      })),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={[styles.statChange, s.positive ? styles.positive : styles.negative]}>
                {s.change}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.activityList}>
          {ACTIVITIES.map(a => (
            <View key={a.id} style={styles.activityRow}>
              <View style={styles.activityBullet} />
              <View style={styles.activityContent}>
                <Text style={styles.activityAction}>{a.action}</Text>
                <Text style={styles.activityDetail}>{a.detail}</Text>
              </View>
              <Text style={styles.activityTime}>{a.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statChange: {
    fontSize: 12,
    marginTop: 4,
  },
  positive: { color: '#2e7d32' },
  negative: { color: '#c62828' },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
});
