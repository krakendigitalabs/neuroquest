import { Zap, Wind, Waves } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BreathingExercise } from './_components/breathing-exercise';

export default function RegulationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Emotional Regulation</h1>
      </div>
      <p className="text-muted-foreground">
        Use these tools to manage acute anxiety and bring your nervous system back to a state of calm.
      </p>

      <div className="grid gap-6 mt-6 md:grid-cols-1 lg:grid-cols-2">
        <BreathingExercise 
          title="Box Breathing"
          description="A simple technique to calm your nervous system."
          icon={<Wind className="h-8 w-8 text-primary" />}
          steps={["Inhale for 4s", "Hold for 4s", "Exhale for 4s", "Hold for 4s"]}
        />
        <BreathingExercise 
          title="4-6 Breathing"
          description="Lengthen your exhale to activate the parasympathetic nervous system."
          icon={<Waves className="h-8 w-8 text-primary" />}
          steps={["Inhale for 4s", "Exhale for 6s"]}
        />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <span>5-4-3-2-1 Grounding Exercise</span>
            </CardTitle>
            <CardDescription>
              Use this technique when you feel overwhelmed or detached. It helps bring you back to the present moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Acknowledge:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>5 things you can see:</strong> Look around and name five objects. Notice their color, shape, and texture.</li>
              <li><strong>4 things you can feel:</strong> Notice the sensation of your clothes, the chair you're sitting on, or an object in your hands.</li>
              <li><strong>3 things you can hear:</strong> Listen for three sounds, both near and far. The hum of a fan, birds outside, your own breathing.</li>
              <li><strong>2 things you can smell:</strong> What scents are in the air? Your coffee, a flower, the soap on your hands.</li>
              <li><strong>1 thing you can taste:</strong> Notice the taste in your mouth. Take a sip of water or focus on the lingering taste of your last meal.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
