import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createInvitation, deleteInvitation, getInvitations, listModuleKeys, normalizeSelectedModules, setInvitationStatus } from '@/modules/superadmin/console-data';
import { requireSuperadminServerUser } from '@/modules/superadmin/server-session';

async function createInviteAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();
  const email = formData.get('email')?.toString() ?? '';
  if (!email.includes('@')) {
    redirect('/superadmin/invites?status=invalid-email');
  }

  const expiresInDays = Number(formData.get('expiresInDays') ?? 0);
  const expiresAt = Number.isFinite(expiresInDays) && expiresInDays > 0
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  await createInvitation({
    email,
    role: (formData.get('role')?.toString() ?? 'guest') as 'guest' | 'patient' | 'professional' | 'clinic',
    allowedModules: normalizeSelectedModules(formData.getAll('allowedModules')),
    expiresAt,
    notes: formData.get('notes')?.toString() ?? '',
    actorEmail: actor.email?.toLowerCase() ?? 'superadmin@local',
  });

  revalidatePath('/superadmin/invites');
  redirect('/superadmin/invites?status=created');
}

async function revokeInviteAction(formData: FormData) {
  'use server';
  const actor = await requireSuperadminServerUser();
  const inviteId = formData.get('inviteId')?.toString() ?? '';
  if (!inviteId) {
    redirect('/superadmin/invites?status=missing-id');
  }
  await setInvitationStatus(inviteId, 'revoked', actor.email?.toLowerCase() ?? 'superadmin@local');
  revalidatePath('/superadmin/invites');
  redirect('/superadmin/invites?status=revoked');
}

async function deleteInviteAction(formData: FormData) {
  'use server';
  await requireSuperadminServerUser();
  const inviteId = formData.get('inviteId')?.toString() ?? '';
  if (!inviteId) {
    redirect('/superadmin/invites?status=missing-id');
  }
  await deleteInvitation(inviteId);
  revalidatePath('/superadmin/invites');
  redirect('/superadmin/invites?status=deleted');
}

function formatDate(value: Date | null) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

export default async function SuperadminInvitesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const statusParam = typeof params?.status === 'string' ? params.status : null;
  const invitations = await getInvitations(120).catch(() => []);
  const moduleKeys = listModuleKeys();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Invitados</h1>
        <p className="text-sm text-slate-300">
          Alta manual, expiración, revocación y limpieza de invitados.
        </p>
        {statusParam ? (
          <Badge className="border-0 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/15">
            Operación: {statusParam}
          </Badge>
        ) : null}
      </header>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Crear invitación manual</CardTitle>
          <CardDescription className="text-slate-400">
            Registra invitaciones en Firestore con módulos permitidos y expiración opcional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createInviteAction} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input type="email" name="email" required placeholder="correo@dominio.com" className="border-slate-700 bg-slate-950/60" />
              <select name="role" className="h-10 rounded-md border border-slate-700 bg-slate-950/60 px-3 text-sm">
                <option value="guest">guest</option>
                <option value="patient">patient</option>
                <option value="professional">professional</option>
                <option value="clinic">clinic</option>
              </select>
              <Input
                type="number"
                min={0}
                name="expiresInDays"
                placeholder="Expira en días (0 sin expiración)"
                className="border-slate-700 bg-slate-950/60"
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {moduleKeys.map((module) => (
                <label key={module} className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" name="allowedModules" value={module} />
                  {module}
                </label>
              ))}
            </div>
            <Textarea name="notes" placeholder="Notas de acceso para el invitado" className="min-h-[84px] border-slate-700 bg-slate-950/60" />
            <Button type="submit" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
              Crear invitación
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Invitaciones registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2">Correo</th>
                  <th className="pb-2">Rol</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Expira</th>
                  <th className="pb-2">Módulos</th>
                  <th className="pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invitations.map((invite) => (
                  <tr key={invite.id}>
                    <td className="py-3 pr-4 text-slate-200">{invite.email}</td>
                    <td className="py-3 pr-4 text-slate-300">{invite.role}</td>
                    <td className="py-3 pr-4">
                      <Badge className="bg-slate-800 text-slate-200">{invite.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{formatDate(invite.expiresAt)}</td>
                    <td className="py-3 pr-4 text-slate-300">{invite.allowedModules.join(', ') || '-'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <form action={revokeInviteAction}>
                          <input type="hidden" name="inviteId" value={invite.id} />
                          <Button type="submit" variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-200">
                            Revocar
                          </Button>
                        </form>
                        <form action={deleteInviteAction}>
                          <input type="hidden" name="inviteId" value={invite.id} />
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
