import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { assignTheme, getThemeAssignments, SUPERADMIN_THEME_PRESETS } from '@/modules/superadmin/console-data';
import { requireSuperadminServerUser } from '@/modules/superadmin/server-session';

async function assignThemeAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();
  const targetType = formData.get('targetType') === 'organization' ? 'organization' : 'user';
  const targetId = formData.get('targetId')?.toString().trim() ?? '';
  if (!targetId) {
    redirect('/superadmin/themes?status=missing-target');
  }
  const themePreset = formData.get('themePreset')?.toString() ?? 'dark-blue';
  const preset = SUPERADMIN_THEME_PRESETS.find((entry) => entry.id === themePreset) ?? SUPERADMIN_THEME_PRESETS[0];

  await assignTheme({
    targetType,
    targetId,
    targetLabel: formData.get('targetLabel')?.toString().trim() ?? targetId,
    themePreset,
    primaryColor: formData.get('primaryColor')?.toString().trim() || preset.primary,
    secondaryColor: formData.get('secondaryColor')?.toString().trim() || preset.secondary,
    actorEmail: actor.email?.toLowerCase() ?? 'superadmin@local',
  });

  revalidatePath('/superadmin/themes');
  redirect('/superadmin/themes?status=assigned');
}

function formatDate(value: Date | null) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

export default async function SuperadminThemesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const statusParam = typeof params?.status === 'string' ? params.status : null;
  const assignments = await getThemeAssignments(80).catch(() => []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Temas y branding</h1>
        <p className="text-sm text-slate-300">10 combinaciones visuales administrables por cuenta u organización.</p>
        {statusParam ? (
          <Badge className="border-0 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/15">
            Operación: {statusParam}
          </Badge>
        ) : null}
      </header>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Biblioteca de temas</CardTitle>
          <CardDescription className="text-slate-400">
            Catálogo de combinaciones light/dark para identidad visual operativa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {SUPERADMIN_THEME_PRESETS.map((theme) => (
              <div key={theme.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-medium text-slate-100">{theme.name}</p>
                <p className="text-xs text-slate-400">{theme.id}</p>
                <p className="mt-2 text-xs text-slate-400">Modo: {theme.mode}</p>
                <div className="mt-3 flex gap-2">
                  <span className="h-6 w-10 rounded-md border border-slate-700" style={{ backgroundColor: theme.primary }} />
                  <span className="h-6 w-10 rounded-md border border-slate-700" style={{ backgroundColor: theme.secondary }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Asignar tema</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={assignThemeAction} className="grid gap-3 md:grid-cols-2">
            <select name="targetType" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
              <option value="user">user</option>
              <option value="organization">organization</option>
            </select>
            <Input name="targetId" required placeholder="userId u organizationId" className="border-slate-700 bg-slate-950/60" />
            <Input name="targetLabel" placeholder="Etiqueta visible (opcional)" className="border-slate-700 bg-slate-950/60" />
            <select name="themePreset" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
              {SUPERADMIN_THEME_PRESETS.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <Input name="primaryColor" placeholder="#RRGGBB (opcional)" className="border-slate-700 bg-slate-950/60" />
            <Input name="secondaryColor" placeholder="#RRGGBB (opcional)" className="border-slate-700 bg-slate-950/60" />
            <div className="md:col-span-2">
              <Button type="submit" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                Guardar asignación
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Asignaciones activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Destino</th>
                  <th className="pb-2">Tema</th>
                  <th className="pb-2">Colores</th>
                  <th className="pb-2">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="py-3 pr-4 text-slate-200">
                      {assignment.targetType}: {assignment.targetLabel || assignment.targetId}
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{assignment.themePreset}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <span className="h-5 w-8 rounded border border-slate-700" style={{ backgroundColor: assignment.primaryColor }} />
                        <span className="h-5 w-8 rounded border border-slate-700" style={{ backgroundColor: assignment.secondaryColor }} />
                      </div>
                    </td>
                    <td className="py-3 text-slate-400">{formatDate(assignment.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
