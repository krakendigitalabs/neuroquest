import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { AccountRole } from '@/lib/account-role';
import type { AppAccessRole, UserRole } from '@/models/user';
import {
  getManagedUsers,
  normalizeVisibilityLimit,
  resolveUserRoleFromAccessRole,
  saveManagedUser,
  setManagedUserStatus,
  deleteManagedUser,
  SUPERADMIN_THEME_PRESETS,
} from '@/modules/superadmin/console-data';
import { requireSuperadminServerUser } from '@/modules/superadmin/server-session';

const ACCOUNT_ROLES: AccountRole[] = ['owner', 'manager', 'administrator', 'editor', 'commentator', 'viewer'];
const ACCESS_ROLES: AppAccessRole[] = ['clinic', 'professional', 'patient', 'guest'];

function toUserRole(value: string, accessRole: AppAccessRole): UserRole {
  if (value === 'clinic' || value === 'professional' || value === 'patient') {
    return value;
  }
  return resolveUserRoleFromAccessRole(accessRole);
}

async function saveAccountAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();

  const accessRole = (formData.get('role')?.toString() ?? 'patient') as AppAccessRole;
  const accountRole = (formData.get('accountRole')?.toString() ?? 'viewer') as AccountRole;

  await saveManagedUser({
    id: formData.get('userId')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    displayName: formData.get('displayName')?.toString() ?? '',
    role: accessRole,
    userRole: toUserRole(formData.get('userRole')?.toString() ?? '', accessRole),
    accountRole,
    accountStatus: formData.get('accountStatus') === 'inactive' ? 'inactive' : 'active',
    organizationName: formData.get('organizationName')?.toString() ?? '',
    moduleVisibilityLimit: normalizeVisibilityLimit(formData.get('moduleVisibilityLimit')),
    themePreset: formData.get('themePreset')?.toString() ?? 'dark-blue',
    adminNotes: formData.get('adminNotes')?.toString() ?? '',
    actorEmail: actor.email?.toLowerCase() ?? 'superadmin@local',
  });

  revalidatePath('/superadmin/accounts');
  redirect('/superadmin/accounts?status=saved');
}

async function toggleStatusAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();
  const userId = formData.get('userId')?.toString() ?? '';
  if (!userId) {
    redirect('/superadmin/accounts?status=missing-user');
  }
  const nextStatus = formData.get('nextStatus') === 'inactive' ? 'inactive' : 'active';
  await setManagedUserStatus(userId, nextStatus, actor.email?.toLowerCase() ?? 'superadmin@local');
  revalidatePath('/superadmin/accounts');
  redirect('/superadmin/accounts?status=updated');
}

async function deleteAccountAction(formData: FormData) {
  'use server';
  await requireSuperadminServerUser();
  const userId = formData.get('userId')?.toString() ?? '';
  if (!userId) {
    redirect('/superadmin/accounts?status=missing-user');
  }
  await deleteManagedUser(userId);
  revalidatePath('/superadmin/accounts');
  redirect('/superadmin/accounts?status=deleted');
}

function formatDate(value: Date | null) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

export default async function SuperadminAccountsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const statusParam = typeof params?.status === 'string' ? params.status : null;
  const users = await getManagedUsers(120).catch(() => []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Cuentas</h1>
        <p className="text-sm text-slate-300">
          Alta, actualización, activación e inactivación real de clínicas, profesionales, pacientes e invitados.
        </p>
        {statusParam ? (
          <Badge className="border-0 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/15">
            Operación: {statusParam}
          </Badge>
        ) : null}
      </header>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Crear o actualizar cuenta</CardTitle>
          <CardDescription className="text-slate-400">
            Usa `userId` para editar una cuenta existente. Si está vacío, se crea una cuenta manual por email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveAccountAction} className="grid gap-3 md:grid-cols-2">
            <Input name="userId" placeholder="userId (opcional para editar)" className="border-slate-700 bg-slate-950/60" />
            <Input name="email" type="email" placeholder="correo@dominio.com" required className="border-slate-700 bg-slate-950/60" />
            <Input name="displayName" placeholder="Nombre visible" required className="border-slate-700 bg-slate-950/60" />
            <Input name="organizationName" placeholder="Clínica / organización" className="border-slate-700 bg-slate-950/60" />
            <select name="role" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
              {ACCESS_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select name="userRole" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
              <option value="">auto por rol</option>
              <option value="clinic">clinic</option>
              <option value="professional">professional</option>
              <option value="patient">patient</option>
            </select>
            <select name="accountRole" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
              {ACCOUNT_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
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
            <select name="themePreset" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
              {SUPERADMIN_THEME_PRESETS.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <div className="md:col-span-2">
              <Textarea
                name="adminNotes"
                placeholder="Observaciones administrativas"
                className="min-h-[88px] border-slate-700 bg-slate-950/60"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                Guardar cuenta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Listado operativo</CardTitle>
          <CardDescription className="text-slate-400">
            Cambia estado o elimina cuentas manuales desde la consola.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Cuenta</th>
                  <th className="pb-2">Roles</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Organización</th>
                  <th className="pb-2">Creado</th>
                  <th className="pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-100">{user.displayName}</p>
                      <p className="text-xs text-slate-400">{user.email || user.id}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">
                      {user.role} / {user.userRole} / {user.accountRole}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={user.accountStatus === 'active' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}>
                        {user.accountStatus}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{user.organizationName || '-'}</td>
                    <td className="py-3 pr-4 text-slate-400">{formatDate(user.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <form action={toggleStatusAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="nextStatus" value={user.accountStatus === 'active' ? 'inactive' : 'active'} />
                          <Button type="submit" variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-200">
                            {user.accountStatus === 'active' ? 'Inactivar' : 'Activar'}
                          </Button>
                        </form>
                        <form action={deleteAccountAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <Button type="submit" variant="outline" className="border-rose-800 bg-rose-950/30 text-rose-200 hover:bg-rose-950/50">
                            Eliminar
                          </Button>
                        </form>
                      </div>
                    </td>
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
