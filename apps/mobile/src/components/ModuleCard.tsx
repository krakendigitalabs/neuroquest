import { Pressable, StyleSheet, Text, View } from 'react-native';

type ModuleCardProps = {
  title: string;
  description: string;
  enabled: boolean;
};

export function ModuleCard({ title, description, enabled }: ModuleCardProps) {
  return (
    <Pressable style={[styles.card, !enabled && styles.disabled]} disabled={!enabled}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.badge, enabled ? styles.badgeOn : styles.badgeOff]}>{enabled ? 'Activo' : 'Bloqueado'}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0b1220',
    padding: 14,
    gap: 10,
  },
  disabled: {
    opacity: 0.55,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 16,
  },
  description: {
    color: '#94a3b8',
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
  },
  badgeOn: {
    color: '#86efac',
    backgroundColor: '#14532d',
  },
  badgeOff: {
    color: '#fecaca',
    backgroundColor: '#7f1d1d',
  },
});
