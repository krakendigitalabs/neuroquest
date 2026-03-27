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
import { getPatientStatus, toDate } from "@/app/therapist/_lib/therapist-utils";

const CHECK_IN_MAX_SCORE = 21;

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
    const hasCheckIn = !!patient.latestCheckInAt;
    return {
      ...patient,
      hasCheckIn,
      progressValue,
      status: getPatientStatus(patient.latestCheckInLevel),
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
  const patientsWithCheckIn = patientRows.filter((patient) => patient.hasCheckIn && typeof patient.latestCheckInScore === 'number');
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
      <header className="sticky top-0 flex min-h-16 flex-wrap items-center gap-3 border-b bg-background px-4 py-3 md:px-6">
        <Logo className="shrink-0" />
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/therapist"
            className="text-foreground transition-colors hover:text-foreground"
          >
            {t('therapist.dashboard')}
          </Link>
          <Link
            href="/therapist#patients"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('therapist.patients')}
          </Link>
          <Link
            href="/therapist#analytics"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('therapist.analytics')}
          </Link>
        </nav>
        <div className="flex w-full items-center gap-3 sm:w-auto md:ml-auto md:gap-2 lg:gap-4">
          <div className="w-full sm:w-auto">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">{t('therapist.backToSite')}</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div id="analytics" className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
        <Card id="patients">
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
            <div className="space-y-3 md:hidden">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="rounded-lg border p-4"
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{patient.displayName || patient.email}</p>
                      <p className="truncate text-sm text-muted-foreground">{patient.email}</p>
                    </div>
                    <Badge variant={patient.status === 'active' ? 'secondary' : 'destructive'}>
                      {t(`therapist.statuses.${patient.status}`)}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('therapist.level')}</p>
                      <p className="text-sm font-medium">{t('userProgress.level', { level: patient.level })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('therapist.latestCheckIn')}</p>
                      <p className="text-sm font-medium">
                        {patient.hasCheckIn && typeof patient.latestCheckInScore === 'number' ? `${patient.latestCheckInScore}/${CHECK_IN_MAX_SCORE}` : t('therapist.noCheckInYet')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('therapist.lastActivity')}</p>
                      <p className="text-sm font-medium">{patient.lastActivity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('therapist.progress')}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={patient.progressValue} className="h-2 flex-1" />
                        <span className="text-xs font-medium">{Math.round(patient.progressValue)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/therapist/patient/${patient.id}`}>{t('therapist.viewDetails')}</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                  {patientRows.length === 0 ? t('therapist.noPatientsAssigned') : t('therapist.noPatientsMatchFilters')}
                </div>
              )}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('therapist.name')}</TableHead>
                    <TableHead>{t('therapist.level')}</TableHead>
                    <TableHead>{t('therapist.latestCheckIn')}</TableHead>
                    <TableHead>{t('therapist.status')}</TableHead>
                    <TableHead>{t('therapist.progress')}</TableHead>
                    <TableHead>{t('therapist.lastActivity')}</TableHead>
                    <TableHead>{t('therapist.actions')}</TableHead>
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
                      <TableCell>{patient.hasCheckIn && typeof patient.latestCheckInScore === 'number' ? `${patient.latestCheckInScore}/${CHECK_IN_MAX_SCORE}` : t('therapist.noCheckInYet')}</TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'active' ? 'secondary' : 'destructive'}>{t(`therapist.statuses.${patient.status}`)}</Badge>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-2">
                              <Progress value={patient.progressValue} className="h-2 w-24" />
                              <span>{Math.round(patient.progressValue)}%</span>
                          </div>
                      </TableCell>
                      <TableCell>{patient.lastActivity}</TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/therapist/patient/${patient.id}`}>{t('therapist.viewDetails')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPatients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {patientRows.length === 0 ? t('therapist.noPatientsAssigned') : t('therapist.noPatientsMatchFilters')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
                  <p className="break-words text-lg font-semibold">
                    {selectedPatient.hasCheckIn && typeof selectedPatient.latestCheckInScore === 'number' ? `${selectedPatient.latestCheckInScore}/${CHECK_IN_MAX_SCORE}` : t('therapist.noCheckInYet')}
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
                  <p className="break-words text-lg font-semibold">
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
                    <p className="break-words text-sm font-medium">{thought.thoughtText}</p>
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
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="break-words text-sm font-medium">{mission.title}</p>
                      <Badge variant={mission.status === 'completed' ? 'secondary' : mission.status === 'failed' ? 'destructive' : 'outline'}>
                        {mission.status}
                      </Badge>
                    </div>
                    <p className="mt-1 break-words text-xs text-muted-foreground">{mission.description}</p>
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
