import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CrisisButton() {
  return (
    <Button variant="destructive" className="w-full justify-start gap-2" asChild>
      <Link href="/crisis">
        <AlertTriangle className="h-5 w-5" />
        <span>Crisis Support</span>
      </Link>
    </Button>
  )
}
