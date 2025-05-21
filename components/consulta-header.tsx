import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface ConsultaHeaderProps {
  consulta: {
    id: string
    perfil: {
      nome: string
    }
  }
}

export function ConsultaHeader({ consulta }: ConsultaHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Consulta: {consulta.perfil.nome}</h1>
      </div>
    </div>
  )
}
