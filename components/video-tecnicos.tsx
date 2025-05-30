interface VideoTecnicosProps {
  video: {
    plataforma?: string
    dimensoes?: string
    patrocinado?: boolean
    tipo_conteudo?: string
  }
}

export function VideoTecnicos({ video }: VideoTecnicosProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Detalhes Técnicos</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Plataforma:</p>
          <p className="text-foreground">{video.plataforma || "Instagram"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Dimensões:</p>
          <p className="text-foreground">{video.dimensoes || "640 x 1136"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Patrocinado:</p>
          <p className="text-foreground">{video.patrocinado ? "Sim" : "Não"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Tipo de conteúdo:</p>
          <p className="text-foreground">{video.tipo_conteudo || "Vídeo"}</p>
        </div>
      </div>
    </div>
  )
}
