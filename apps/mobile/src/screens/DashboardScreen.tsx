import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ModuleCard } from '../components/ModuleCard';
import { useAuthStore } from '../store/auth-store';
import type { AppRole } from '../types';

const MODULE_COPY: Record<string, { title: string; description: string }> = {
  'check-in': {
    title: 'Chequeo Mental',
    description: 'Registro clínico diario con score y severidad.',
  },
  progress: {
    title: 'Progreso',
    description: 'Resumen de evolución personal y terapéutica.',
  },
  regulation: {
    title: 'Regulación Emocional',
    description: 'Técnicas activas para estabilización.',
  },
};

const ROLE_SUMMARY: Record<AppRole, string> = {
  patient: 'Vista paciente: seguimiento diario, chequeo y autorregulación.',
  professional: 'Vista profesional: revisión clínica y coordinación terapéutica.',
  clinic: 'Vista clínica: operación de equipos y control de módulos.',
  guest: 'Vista invitado: acceso limitado para onboarding inicial.',
};

export function DashboardScreen() {
  const access = useAuthStore((state) => state.access);
  const user = useAuthStore((state) => state.user);
  const modules = access?.visibleModules ?? [];
  const role = access?.role ?? 'guest';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>
        {user?.email ?? 'Sin usuario'} · rol: {role}
      </Text>
      <Text style={styles.roleSummary}>{ROLE_SUMMARY[role]}</Text>

      <View style={styles.grid}>
        {(['check-in', 'progress', 'regulation'] as const).map((moduleKey) => {
          const copy = MODULE_COPY[moduleKey];
          return (
            <ModuleCard
              key={moduleKey}
              title={copy.title}
              description={copy.description}
              enabled={modules.includes(moduleKey)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    color: '#94a3b8',
  },
  roleSummary: {
    color: '#a5b4fc',
    fontSize: 13,
  },
  grid: {
    gap: 12,
  },
});
