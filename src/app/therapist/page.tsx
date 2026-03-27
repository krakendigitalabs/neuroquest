'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, BrainCircuit, ClipboardList, Search, Users } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "@/context/language-provider"
import { useAdmin } from "@/hooks/use-admin";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where } from "firebase/firestore";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import type { ExposureMission } from "@/models/exposure-mission";
import type { ThoughtRecord } from "@/models/thought-record";
import type { UserProfile } from "@/models/user";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export default function TherapistDashboard() {
  const { t } = useTranslation();
  const { isAdmin, isLoading } = useAdmin();
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'needs_attention'>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const patientsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users'), where('therapistIds', 'array-contains', user.uid));
  }, [firestore, user]);
  const { data: patients, isLoading: arePatientsLoading } = useCollection<UserProfile>(patientsQuery);

  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedPatientId) return null;
    return collection(firestore, 'users', selectedPatientId, 'thoughtRecords');
  }, [firestore, selectedPatientId]);
  const { data: thoughts, isLoading: areThoughtsLoading } = useCollection<ThoughtRecord>(thoughtsQuery);

  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedPatientId) return null;
    return collection(firestore, 'users', selectedPatientId, 'exposureMissions');
  }, [firestore, selectedPatientId]);
  const { data: missions, isLoading: areMissionsLoading } = useCollection<ExposureMission>(missionsQuery);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isLoading, router]);

  const patientRows = (patients ?? []).map((patient) => {
    const progressValue = patient.xpToNextLevel > 0 ? (patient.currentXp / patient.xpToNextLevel) * 100 : 0;
    const needsAttention = patient.latestCheckInLevel === 'severe';
    return {
      ...patient,
      progressValue,
      status: needsAttention ? 'needs_attention' : 'active',
      lastActivity: patient.latestCheckInAt ? toDate(patient.latestCheckInAt)?.toLocaleDateString() : t('therapist.noRecentActivity'),
    };
  });

  const filteredPatients = patientRows.filter((patient) => {
    const matchesSearch =
      !searchTerm ||
      patient.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (filteredPatients.length === 0) {
      setSelectedPatientId(null);
      return;
    }
    if (!selectedPatientId || !filteredPatients.some((patient) => patient.id === selectedPatientId)) {
      setSelectedPatientId(filteredPatients[0].id);
    }
  }, [filteredPatients, selectedPatientId]);

  const selectedPatient = filteredPatients.find((patient) => patient.id === selectedPatientId) ?? null;
  const selectedPatientThoughts = selectedPatient
    ? [...(thoughts ?? [])]
        .sort((a, b) => (toDate(a.recordedAt)?.getTime() ?? 0) - (toDate(b.recordedAt)?.getTime() ?? 0))
        .slice(-5)
        .reverse()
    : [];

  const selectedPatientMissions = selectedPatient
    ? [...(missions ?? [])]
        .sort((a, b) => (toDate(a.completionDate ?? a.createdAt)?.getTime() ?? 0) - (toDate(b.completionDate ?? b.createdAt)?.getTime() ?? 0))
        .slice(-5)
        .reverse()
    : [];

  const selectedPatientCompletedMissions = (missions ?? []).filter((mission) => mission.status === 'completed').length;
  const selectedPatientActiveMissions = (missions ?? []).filter((mission) => mission.status === 'active').length;

  const activeThisWeek = patientRows.filter((patient) => {
    const date = toDate(patient.latestCheckInAt);
    if (!date) return false;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return date >= threshold;
  }).length;

  const needsAttentionCount = patientRows.filter((patient) => patient.status === 'needs_attention').length;
  const patientsWithCheckIn = patientRows.filter((patient) => typeof patient.latestCheckInScore === 'number');
  const averageLatestCheckIn = patientsWithCheckIn.length
    ? (
        patientsWithCheckIn.reduce((sum, patient) => sum + (patient.latestCheckInScore ?? 0), 0) /
        patientsWithCheckIn.length
      ).toFixed(1)
    : null;

  if (isLoading || !isAdmin || arePatientsLoading || areThoughtsLoading || areMissionsLoading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Logo />
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            {t('therapist.dashboard')}
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('therapist.patients')}
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('therapist.analytics')}
          </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial">
                <Link href="/">
                    <Button variant="outline">{t('therapist.backToSite')}</Button>
                </Link>
            </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.totalPatients')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientRows.length}</div>
              <p className="text-xs text-muted-foreground">{t('therapist.totalPatientsRealDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.activeThisWeek')}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeThisWeek}</div>
              <p className="text-xs text-muted-foreground">{t('therapist.activeThisWeekRealDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.needsAttention')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{needsAttentionCount}</div>
              <p className="text-xs text-muted-foreground">{t('therapist.needsAttentionRealDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.averageLatestCheckIn')}</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageLatestCheckIn ?? t('therapist.noCheckInYet')}</div>
              <p className="text-xs text-muted-foreground">{t('therapist.averageLatestCheckInDesc')}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('therapist.patients')}</CardTitle>
            <CardDescription>{t('therapist.managePatients')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t('therapist.searchPatients')}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'needs_attention')}>
                <SelectTrigger>
                  <SelectValue placeholder={t('therapist.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('therapist.filters.all')}</SelectItem>
                  <SelectItem value="active">{t('therapist.filters.active')}</SelectItem>
                  <SelectItem value="needs_attention">{t('therapist.filters.needs_attention')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('therapist.name')}</TableHead>
                  <TableHead>{t('therapist.level')}</TableHead>
                  <TableHead>{t('therapist.latestCheckIn')}</TableHead>
                  <TableHead>{t('therapist.status')}</TableHead>
                  <TableHead>{t('therapist.progress')}</TableHead>
                  <TableHead>{t('therapist.lastActivity')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className={patient.id === selectedPatientId ? 'bg-muted/40' : undefined}
                    onClick={() => setSelectedPatientId(patient.id)}
                  >
                    <TableCell className="font-medium">{patient.displayName || patient.email}</TableCell>
                    <TableCell>{t('userProgress.level', { level: patient.level })}</TableCell>
                    <TableCell>{typeof patient.latestCheckInScore === 'number' ? `${patient.latestCheckInScore}/20` : t('therapist.noCheckInYet')}</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === 'active' ? 'secondary' : 'destructive'}>{t(`therapist.statuses.${patient.status}`)}</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Progress value={patient.progressValue} className="w-24 h-2" />
                            <span>{Math.round(patient.progressValue)}%</span>
                        </div>
                    </TableCell>
                    <TableCell>{patient.lastActivity}</TableCell>
                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {patientRows.length === 0 ? t('therapist.noPatientsAssigned') : t('therapist.noPatientsMatchFilters')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedPatient && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('therapist.selectedPatient')}</CardTitle>
                <CardDescription>{selectedPatient.displayName || selectedPatient.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t('therapist.latestCheckIn')}</p>
                  <p className="text-lg font-semibold">
                    {typeof selectedPatient.latestCheckInScore === 'number' ? `${selectedPatient.latestCheckInScore}/20` : t('therapist.noCheckInYet')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('therapist.status')}</p>
                  <Badge variant={selectedPatient.status === 'active' ? 'secondary' : 'destructive'}>
                    {t(`therapist.statuses.${selectedPatient.status}`)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('therapist.latestMissionSummary')}</p>
                  <p className="text-lg font-semibold">
                    {selectedPatientCompletedMissions} {t('therapist.completed').toLowerCase()} / {selectedPatientActiveMissions} {t('therapist.activeMissions').toLowerCase()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  {t('therapist.recentThoughts')}
                </CardTitle>
                <CardDescription>{t('therapist.recentThoughtsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPatientThoughts.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('therapist.noThoughtsYet')}</p>
                )}
                {selectedPatientThoughts.map((thought) => (
                  <div key={thought.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{thought.thoughtText}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('observer.emotion')}: {thought.associatedEmotion} | {t('observer.intensity')}: {thought.intensity}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  {t('therapist.recentMissions')}
                </CardTitle>
                <CardDescription>{t('therapist.recentMissionsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPatientMissions.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('therapist.noMissionsYet')}</p>
                )}
                {selectedPatientMissions.map((mission) => (
                  <div key={mission.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{mission.title}</p>
                      <Badge variant={mission.status === 'completed' ? 'secondary' : mission.status === 'failed' ? 'destructive' : 'outline'}>
                        {mission.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{mission.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
