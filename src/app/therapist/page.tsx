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
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Progress } from "@/components/ui/progress"
import { useTranslation } from "@/context/language-provider"

const patients = [
  { id: 'USR-001', name: 'John Doe', condition: 'OCD', progress: 75, anxietyTrend: 'down', lastActivity: '2 hours ago', status: 'Active' },
  { id: 'USR-002', name: 'Jane Smith', condition: 'Anxiety', progress: 40, anxietyTrend: 'stable', lastActivity: '1 day ago', status: 'Active' },
  { id: 'USR-003', name: 'Peter Jones', condition: 'OCD', progress: 20, anxietyTrend: 'up', lastActivity: '3 days ago', status: 'Needs Attention' },
  { id: 'USR-004', name: 'Mary Johnson', condition: 'Panic Disorder', progress: 90, anxietyTrend: 'down', lastActivity: '5 hours ago', status: 'Active' },
  { id: 'USR-005', name: 'David Williams', condition: 'Anxiety', progress: 55, anxietyTrend: 'stable', lastActivity: 'Yesterday', status: 'Active' },
]

export default function TherapistDashboard() {
  const { t } = useTranslation();
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
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">{t('therapist.totalPatientsChange', { value: 2 })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.activeThisWeek')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.filter(p => p.lastActivity.includes('hour') || p.lastActivity.includes('day')).length}</div>
              <p className="text-xs text-muted-foreground">{t('therapist.activeThisWeekDesc')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.needsAttention')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{patients.filter(p => p.status === 'Needs Attention').length}</div>
              <p className="text-xs text-muted-foreground">{t('therapist.needsAttentionDesc')}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('therapist.patients')}</CardTitle>
            <CardDescription>{t('therapist.managePatients')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('therapist.name')}</TableHead>
                  <TableHead>{t('therapist.condition')}</TableHead>
                  <TableHead>{t('therapist.status')}</TableHead>
                  <TableHead>{t('therapist.progress')}</TableHead>
                  <TableHead>{t('therapist.lastActivity')}</TableHead>
                  <TableHead>{t('therapist.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.condition}</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === 'Active' ? 'secondary' : 'destructive'}>{t(patient.status === 'Active' ? 'therapist.statusActive' : 'therapist.statusNeedsAttention')}</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Progress value={patient.progress} className="w-24 h-2" />
                            <span>{patient.progress}%</span>
                        </div>
                    </TableCell>
                    <TableCell>{patient.lastActivity}</TableCell>
                    <TableCell>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t('therapist.toggleMenu')}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
