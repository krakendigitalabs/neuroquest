import { Award, BrainCircuit, ShieldAlert, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PersonalizedMissionGenerator } from './_components/personalized-mission-generator';

export default function DashboardPage() {
  const stats = [
    { title: 'XP Earned', value: '1,250', icon: <Award className="h-6 w-6 text-primary" /> },
    { title: 'Compulsions Resisted', value: '42', icon: <ShieldAlert className="h-6 w-6 text-primary" /> },
    { title: 'Thoughts Identified', value: '118', icon: <BrainCircuit className="h-6 w-6 text-primary" /> },
    { title: 'Missions Completed', value: '12', icon: <Target className="h-6 w-6 text-primary" /> },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Explorer!</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Next Personalized Mission</CardTitle>
            <CardDescription>
              Our AI has analyzed your recent activity to create a new challenge for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonalizedMissionGenerator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
