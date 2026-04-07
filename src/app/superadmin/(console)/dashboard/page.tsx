import Link from 'next/link';
import { ArrowRight, ShieldCheck, UserRoundCog, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSuperadminDashboardSummary } from '@/modules/superadmin/dashboard';

function formatDate(value: Date | null) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

type CounterCardProps = {
  title: string;
  value: number;
  helper: string;
};

function CounterCard({ title, value, helper }: CounterCardProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/70 text-slate-100">
      <CardHeader className="space-y-0 pb-2">
        <CardDescription className="text-slate-400">{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{helper}</p>
      </CardContent>
    </Card>
  );
}

export default async function SuperadminDashboardPage() {
  const summary = await getSuperadminDashboardSummary().catch(() => null);

  if (!summary) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-100">Dashboard Superadmin</h1>
        <p className="text-slate-300">
          No se pudo cargar el dashboard. Verifica configuración de Firebase Admin y vuelve a intentar.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.15),transparent_34%),linear-gradient(135deg,#0f172a,#111827)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-200/10 px-3 py-1 text-xs text-amber-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Entorno aislado de superadministración
            </div>
            <h1 className="text-3xl font-semibold text-slate-100">Dashboard Superadmin</h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Vista operacional SaaS para gobernar cuentas, módulos, temas e invitados sin afectar el dashboard clínico.
            </p>
          </div>
          <Badge className="border-0 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/15">
            Sesión superadmin activa
          </Badge>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CounterCard title="Usuarios totales" value={summary.counters.totalUsers} helper="Base total de cuentas creadas" />
        <CounterCard title="Clínicas" value={summary.counters.clinics} helper="Cuentas con userRole=clinic" />
        <CounterCard title="Profesionales" value={summary.counters.professionals} helper="Cuentas con userRole=professional" />
        <CounterCard title="Pacientes" value={summary.counters.patients} helper="Cuentas con userRole=patient" />
        <CounterCard title="Invitados" value={summary.counters.guests} helper="Cuentas role=guest" />
        <CounterCard title="Superadmins" value={summary.counters.superadmins} helper="Registros en roles_admin" />
        <CounterCard title="Con límite de módulos" value={summary.counters.moduleLimitedUsers} helper="moduleVisibilityLimit=1|2|3" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-200" />
              <CardTitle className="text-lg">Cuentas recientes</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Últimos usuarios en `users` para validar altas, roles y configuración inicial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-2 font-medium">Cuenta</th>
                    <th className="pb-2 font-medium">Rol clínico</th>
                    <th className="pb-2 font-medium">Rol workspace</th>
                    <th className="pb-2 font-medium">Creado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {summary.recentUsers.map((user) => (
                    <tr key={user.id} className="align-top">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-100">{user.displayName}</p>
                        <p className="text-xs text-slate-400">{user.email || user.id}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{user.userRole}</td>
                      <td className="py-3 pr-4 text-slate-300">{user.accountRole}</td>
                      <td className="py-3 text-slate-400">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRoundCog className="h-4 w-4 text-amber-200" />
              <CardTitle className="text-lg">Acciones rápidas</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Entradas directas a configuración operativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: '/superadmin/accounts', label: 'Gestionar cuentas' },
              { href: '/superadmin/modules', label: 'Políticas de módulos' },
              { href: '/superadmin/themes', label: 'Temas y branding' },
              { href: '/superadmin/invites', label: 'Invitados manuales' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 transition hover:border-amber-300/40 hover:bg-slate-900"
              >
                {item.label}
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
