import { Target, Lock, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const missions = {
  available: [
    {
      title: 'Touch a "Contaminated" Object',
      description: 'Touch an object you consider mildly contaminated (like a doorknob) and don\'t wash your hands for 5 minutes.',
      type: 'Exposición',
      difficulty: 'Fácil',
      xp: 50,
      completed: false
    },
    {
      title: 'Leave Home Without Checking',
      description: 'Leave your house for a short walk (5-10 minutes) without performing your usual checking rituals for the door or stove.',
      type: 'Exposición',
      difficulty: 'Media',
      xp: 80,
      completed: false
    }
  ],
  completed: [
    {
      title: 'Resist a Minor Compulsion',
      description: 'Acknowledge an urge to perform a minor compulsion and consciously decide not to do it.',
      type: 'Observador Mental',
      difficulty: 'Fácil',
      xp: 30,
      completed: true
    }
  ],
  locked: [
    {
      title: 'Delayed Hand Washing',
      description: 'After using the restroom, wait 15 minutes before washing your hands.',
      type: 'Exposición',
      difficulty: 'Difícil',
      xp: 120,
      completed: false
    }
  ]
};

const MissionCard = ({ mission }: { mission: typeof missions.available[0] | typeof missions.completed[0] | typeof missions.locked[0] }) => (
  <Card className={`transition-all ${mission.completed ? 'bg-secondary/30' : 'hover:shadow-lg hover:-translate-y-1'}`}>
    <CardHeader>
      <CardTitle className="flex items-start justify-between">
        <span className="text-lg">{mission.title}</span>
        {mission.completed ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Target className="h-6 w-6 text-primary" />}
      </CardTitle>
      <CardDescription>{mission.description}</CardDescription>
    </CardHeader>
    <CardFooter className="flex justify-between items-center">
      <div className="flex gap-2">
        <Badge variant="secondary">{mission.type}</Badge>
        <Badge variant="outline">{mission.difficulty}</Badge>
      </div>
      <Badge variant="default" className="bg-primary">{`+${mission.xp} XP`}</Badge>
    </CardFooter>
  </Card>
);

const LockedMissionCard = ({ mission }: { mission: typeof missions.locked[0] }) => (
  <Card className="bg-muted/50 border-dashed">
    <CardHeader>
      <CardTitle className="flex items-start justify-between text-muted-foreground">
        <span className="text-lg">{mission.title}</span>
        <Lock className="h-6 w-6" />
      </CardTitle>
      <CardDescription>{mission.description}</CardDescription>
    </CardHeader>
    <CardFooter className="flex justify-between items-center">
      <div className="flex gap-2">
        <Badge variant="outline">{mission.type}</Badge>
        <Badge variant="outline">{mission.difficulty}</Badge>
      </div>
       <Badge variant="secondary">{`+${mission.xp} XP`}</Badge>
    </CardFooter>
  </Card>
);

export default function ExposurePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Exposure Mode (ERP)</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Custom Mission
        </Button>
      </div>
      <p className="text-muted-foreground">
        Engage in progressively challenging Exposure and Response Prevention (ERP) missions. This is a core part of overcoming OCD and anxiety.
      </p>

      <div className="my-6">
        <Card>
          <CardHeader>
            <CardTitle>Your ERP Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={33} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">You've completed 1 out of 3 available missions.</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Available Missions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {missions.available.map((mission, index) => <MissionCard key={index} mission={mission} />)}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Completed Missions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {missions.completed.map((mission, index) => <MissionCard key={index} mission={mission} />)}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Locked Missions</h2>
           <p className="text-muted-foreground text-sm mb-4">Complete more missions to unlock these challenges.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {missions.locked.map((mission, index) => <LockedMissionCard key={index} mission={mission} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
