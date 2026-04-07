import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRolePolicies } from '@/modules/superadmin/console-data';
import {
  getModuleCatalog,
  getUserOverrides,
  listModuleKeys,
  normalizeSelectedModules,
  normalizeVisibilityLimit,
  saveModuleCatalogEnabled,
  saveRolePolicy,
  saveUserOverride,
  setManagedUserVisibilityLimit,
  setManagedUserStatus,
} from '@/modules/superadmin/console-data';
import { requireSuperadminServerUser } from '@/modules/superadmin/server-session';

async function saveCatalogAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();
  const selected = normalizeSelectedModules(formData.getAll('enabledModules'));
  await saveModuleCatalogEnabled(selected, actor.email?.toLowerCase() ?? 'superadmin@local');
  revalidatePath('/superadmin/modules');
  redirect('/superadmin/modules?status=catalog-saved');
}

async function saveRolePolicyAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();
  const role = formData.get('role')?.toString();
  if (role !== 'guest' && role !== 'patient' && role !== 'professional' && role !== 'clinic') {
    redirect('/superadmin/modules?status=invalid-role');
  }

  const selected = normalizeSelectedModules(formData.getAll('baseModules'));
  const useWildcard = formData.get('allowAll') === 'on';
  const maxPatient = Number(formData.get('maxPatientModules'));
  await saveRolePolicy(
    {
      role,
      baseModules: useWildcard ? ['*'] : selected,
      maxPatientModules: Number.isFinite(maxPatient) && maxPatient > 0 ? Math.min(10, maxPatient) : undefined,
      canCreateModules: formData.get('canCreateModules') === 'on',
    },
    actor.email?.toLowerCase() ?? 'superadmin@local',
  );

  revalidatePath('/superadmin/modules');
  redirect('/superadmin/modules?status=policy-saved');
}

async function saveOverrideAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();
  const userId = formData.get('userId')?.toString().trim() ?? '';
  if (!userId) {
    redirect('/superadmin/modules?status=missing-user');
  }
  await saveUserOverride({
    userId,
    manualAllow: normalizeSelectedModules(formData.getAll('manualAllow')),
    manualDeny: normalizeSelectedModules(formData.getAll('manualDeny')),
    pinnedPatientModules: normalizeSelectedModules(formData.getAll('pinnedPatientModules')),
    actorEmail: actor.email?.toLowerCase() ?? 'superadmin@local',
  });

  const visibility = normalizeVisibilityLimit(formData.get('moduleVisibilityLimit'));
  await setManagedUserStatus(userId, formData.get('accountStatus') === 'inactive' ? 'inactive' : 'active', actor.email?.toLowerCase() ?? 'superadmin@local');
  await setManagedUserVisibilityLimit(userId, visibility, actor.email?.toLowerCase() ?? 'superadmin@local');

  revalidatePath('/superadmin/modules');
  redirect('/superadmin/modules?status=override-saved');
}

export default async function SuperadminModulesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const statusParam = typeof params?.status === 'string' ? params.status : null;
  const catalog = await getModuleCatalog().catch(() => []);
  const policies = await getRolePolicies().catch(() => []);
  const overrides = await getUserOverrides(80).catch(() => []);
  const moduleKeys = listModuleKeys();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Módulos</h1>
        <p className="text-sm text-slate-300">
          Control de catálogo global, políticas por rol y overrides por cuenta.
        </p>
        {statusParam ? (
          <Badge className="border-0 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/15">
            Operación: {statusParam}
          </Badge>
        ) : null}
      </header>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Catálogo global</CardTitle>
          <CardDescription className="text-slate-400">
            Define qué módulos están encendidos a nivel plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveCatalogAction} className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              {catalog.map((module) => (
                <label key={module.key} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm">
                  <input type="checkbox" name="enabledModules" value={module.key} defaultChecked={module.enabled} />
                  <span>{module.name}</span>
                  <span className="ml-auto text-xs text-slate-400">{module.route}</span>
                </label>
              ))}
            </div>
            <Button type="submit" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
              Guardar catálogo
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {policies.map((policy) => (
          <Card key={policy.role} className="border-slate-800 bg-slate-900/60 text-slate-100">
            <CardHeader>
              <CardTitle className="text-base">Política rol: {policy.role}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveRolePolicyAction} className="space-y-3">
                <input type="hidden" name="role" value={policy.role} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="allowAll" defaultChecked={policy.baseModules.includes('*')} />
                  Permitir todos los módulos
                </label>
                <div className="grid gap-2 md:grid-cols-2">
                  {moduleKeys.map((key) => (
                    <label key={`${policy.role}-${key}`} className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        name="baseModules"
                        value={key}
                        defaultChecked={policy.baseModules.includes('*') || policy.baseModules.includes(key)}
                      />
                      {key}
                    </label>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    name="maxPatientModules"
                    type="number"
                    min={1}
                    max={10}
                    defaultValue={policy.maxPatientModules ?? ''}
                    placeholder="maxPatientModules"
                    className="border-slate-700 bg-slate-950/60"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="canCreateModules" defaultChecked={policy.canCreateModules} />
                    Puede crear módulos
                  </label>
                </div>
                <Button type="submit" variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-200">
                  Guardar política
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Override manual por cuenta</CardTitle>
          <CardDescription className="text-slate-400">
            Permite definir allow/deny y módulos fijados para pacientes por usuario específico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveOverrideAction} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input name="userId" required placeholder="userId objetivo" className="border-slate-700 bg-slate-950/60" />
              <select name="accountStatus" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
              <select name="moduleVisibilityLimit" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
                <option value="all">all</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 rounded-md border border-slate-800 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Manual allow</p>
                {moduleKeys.map((key) => (
                  <label key={`allow-${key}`} className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="manualAllow" value={key} />
                    {key}
                  </label>
                ))}
              </div>
              <div className="space-y-2 rounded-md border border-slate-800 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Manual deny</p>
                {moduleKeys.map((key) => (
                  <label key={`deny-${key}`} className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="manualDeny" value={key} />
                    {key}
                  </label>
                ))}
              </div>
              <div className="space-y-2 rounded-md border border-slate-800 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Pines paciente (max 3)</p>
                {moduleKeys.map((key) => (
                  <label key={`pin-${key}`} className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="pinnedPatientModules" value={key} />
                    {key}
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
              Guardar override
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Overrides existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Usuario</th>
                  <th className="pb-2">Allow</th>
                  <th className="pb-2">Deny</th>
                  <th className="pb-2">Pinned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {overrides.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4 text-slate-200">{item.userId}</td>
                    <td className="py-3 pr-4 text-slate-300">{item.manualAllow.join(', ') || '-'}</td>
                    <td className="py-3 pr-4 text-slate-300">{item.manualDeny.join(', ') || '-'}</td>
                    <td className="py-3 text-slate-300">{item.pinnedPatientModules.join(', ') || '-'}</td>
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
