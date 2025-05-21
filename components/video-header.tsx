import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface VideoHeaderProps {
  userRequestId?: string | null; // Permitir string, null ou undefined
}

export function VideoHeader({ userRequestId }: VideoHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href={userRequestId ? `/dashboard/consulta/${userRequestId}` : "/dashboard"}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Detalhes do Vídeo</h1>
      </div>
    </div>
  )
}
