import { Eye, Heart, MessageCircle, Clock } from "lucide-react"

interface VideoStatsProps {
  stats: {
    visualizacoes: number
    curtidas: number
    comentarios: number
    duracao: string
  }
}

export function VideoStats({ stats }: VideoStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border">
      <div className="bg-card rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground mb-1">Total de Visualizações</p>
            <h2 className="text-4xl font-bold text-foreground">{stats.visualizacoes}</h2>
          </div>
          <div className="bg-muted p-2 rounded-full">
            <Eye className="h-6 w-6 text-foreground" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground mb-1">Total de Curtidas</p>
            <h2 className="text-4xl font-bold text-foreground">{stats.curtidas}</h2>
            <p className="text-sm text-muted-foreground">Taxa de curtidas: 316%</p>
          </div>
          <div className="bg-muted p-2 rounded-full">
            <Heart className="h-6 w-6 text-destructive" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground mb-1">Total de Comentários</p>
            <h2 className="text-4xl font-bold text-foreground">{stats.comentarios}</h2>
            <p className="text-sm text-muted-foreground">Taxa de comentários: 0%</p>
          </div>
          <div className="bg-muted p-2 rounded-full">
            <MessageCircle className="h-6 w-6 text-success" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground mb-1">Duração</p>
            <h2 className="text-4xl font-bold text-foreground">{stats.duracao}</h2>
          </div>
          <div className="bg-muted p-2 rounded-full">
            <Clock className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
