interface VideoInfoProps {
  video: {
    published_at?: string
    caption?: string
  }
}

export function VideoInfo({ video }: VideoInfoProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Informações</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Publicado:</p>
          <p className="text-foreground">{video.published_at ? new Date(video.published_at).toLocaleString("pt-BR") : ""}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Descrição:</p>
          <p className="text-sm text-foreground">{video.caption || ""}</p>

          <div className="mt-2 space-y-1 text-sm">

          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Hashtags:</p>
          <p className="text-foreground">Nenhuma hashtag</p>
        </div>
      </div>
    </div>
  )
}
