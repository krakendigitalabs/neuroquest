import { cn } from "@/lib/utils"
import { BrainCircuit } from "lucide-react"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrainCircuit className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold tracking-tight font-headline">
        NeuroQuest
      </span>
    </div>
  )
}
