'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { ShieldCheck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAccountAccess } from '@/hooks/use-account-access';
import { AccountRole, getAssignableAccountRoles } from '@/lib/account-role';
import type { UserProfile, UserRole } from '@/models/user';

type DraftRow = {
  accountRole: AccountRole;
  userRole: UserRole;
};

export default function WorkspaceUsersPage() {
  const { t } = useTranslation();
  const { firestore } = useFirebase();
  const { accountRole, canManageWorkspaceUsers, isLoading } = useAccountAccess();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !canManageWorkspaceUsers) return null;

    return query(collection(firestore, 'users'), orderBy('displayName', 'asc'));
  }, [canManageWorkspaceUsers, firestore]);
  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersQuery);

  const assignableAccountRoles = useMemo(
    () => getAssignableAccountRoles(accountRole),
    [accountRole]
  );

  useEffect(() => {
    if (!isLoading && !canManageWorkspaceUsers) {
      router.push('/dashboard');
    }
  }, [canManageWorkspaceUsers, isLoading, router]);

  const sortedUsers = useMemo(() => [...(users ?? [])], [users]);

  const setDraftField = (userId: string, field: keyof DraftRow, value: string) => {
    const currentUser = sortedUsers.find((entry) => entry.id === userId);
    if (!currentUser) return;

    setDrafts((current) => ({
      ...current,
      [userId]: {
        accountRole: current[userId]?.accountRole ?? currentUser.accountRole,
        userRole: current[userId]?.userRole ?? currentUser.userRole,
        [field]: value,
      } as DraftRow,
    }));
  };

  if (isLoading || areUsersLoading) {
    return <div>{t('loading')}</div>;
  }

  if (!canManageWorkspaceUsers) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{t('workspaceUsers.title')}</h1>
          <p className="text-muted-foreground">{t('workspaceUsers.description')}</p>
        </div>
        <Badge variant="secondary">{t(`accountRoles.${accountRole ?? 'viewer'}`)}</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>{t('workspaceUsers.guardrailsTitle')}</CardTitle>
          </div>
          <CardDescription>{t('workspaceUsers.guardrailsDescription')}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>{t('workspaceUsers.listTitle')}</CardTitle>
          </div>
          <CardDescription>{t('workspaceUsers.listDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedUsers.map((entry) => {
            const draft = drafts[entry.id];
            const currentAccountRole = draft?.accountRole ?? entry.accountRole;
            const currentUserRole = draft?.userRole ?? entry.userRole;
            const hasChanges =
              currentAccountRole !== entry.accountRole ||
              currentUserRole !== entry.userRole;

            return (
              <div key={entry.id} className="rounded-xl border p-4">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_auto] xl:items-center">
                  <div className="space-y-1">
                    <p className="font-medium">{entry.displayName || entry.email || entry.id}</p>
                    <p className="text-sm text-muted-foreground">{entry.email || entry.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('workspaceUsers.currentSummary', {
                        accountRole: t(`accountRoles.${entry.accountRole}`),
                        userRole: t(`userRoles.${entry.userRole}`),
                      })}
                    </p>
                  </div>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium">{t('workspaceUsers.accountRoleLabel')}</span>
                    <Select
                      value={currentAccountRole}
                      onValueChange={(value) => setDraftField(entry.id, 'accountRole', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableAccountRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(`accountRoles.${role}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium">{t('workspaceUsers.userRoleLabel')}</span>
                    <Select
                      value={currentUserRole}
                      onValueChange={(value) => setDraftField(entry.id, 'userRole', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">{t('userRoles.patient')}</SelectItem>
                        <SelectItem value="professional">{t('userRoles.professional')}</SelectItem>
                        <SelectItem value="clinic">{t('userRoles.clinic')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      disabled={!hasChanges}
                      onClick={() => {
                        if (!firestore) return;

                        const docRef = doc(firestore, 'users', entry.id);
                        updateDocumentNonBlocking(docRef, {
                          accountRole: currentAccountRole,
                          userRole: currentUserRole,
                        });
                        setDrafts((current) => {
                          const next = { ...current };
                          delete next[entry.id];
                          return next;
                        });
                      }}
                    >
                      {t('workspaceUsers.save')}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
