import { CognitiveReprogrammer } from "./_components/cognitive-reprogrammer";

export default function ReprogramPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Cognitive Reprogramming</h1>
      </div>
      <p className="text-muted-foreground">
        Challenge catastrophic or magical thinking patterns. Enter a thought below, and our AI will guide you through a cognitive restructuring process to find a more balanced perspective.
      </p>

      <div className="mt-6">
        <CognitiveReprogrammer />
      </div>
    </div>
  );
}
