import { AlertTriangle, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const resources = [
  { name: 'National Suicide Prevention Lifeline', phone: '988', description: 'Available 24/7 for free and confidential support.' },
  { name: 'Crisis Text Line', phone: 'Text HOME to 741741', description: 'Free, 24/7 crisis support via text message.' },
  { name: 'The Trevor Project', phone: '1-866-488-7386', description: 'For LGBTQ young people in crisis.' },
  { name: 'NAMI Helpline', phone: '1-800-950-NAMI (6264)', description: 'National Alliance on Mental Illness for information and referrals.' },
];

export default function CrisisPage() {
  return (
    <div className="flex flex-col min-h-screen bg-destructive/10">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b">
        <h1 className="text-xl font-bold flex items-center gap-2 text-destructive">
          <AlertTriangle />
          Crisis Support
        </h1>
        <div className="ml-auto">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to App</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive bg-background">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">You Are Not Alone</CardTitle>
              <CardDescription className="text-lg">
                If you are in crisis or immediate danger, please use the resources below or call 911. Your safety is the top priority.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.map(resource => (
                <Card key={resource.name} className="bg-background">
                  <CardHeader>
                    <CardTitle className="text-xl">{resource.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      <Phone />
                      <span>{resource.phone}</span>
                    </p>
                    <p className="text-muted-foreground mt-2">{resource.description}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

           <div className="text-center mt-8 text-muted-foreground">
             <p>NeuroQuest is a tool for support and skill-building, not a substitute for professional medical advice, diagnosis, or treatment. </p>
           </div>
        </div>
      </main>
    </div>
  );
}
