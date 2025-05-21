interface VideoInfoProps {
  video: {
    published_at?: string
    caption?: string
  }
}

export function VideoInfo({ video }: VideoInfoProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Informações</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Publicado:</p>
          <p>{video.published_at ? new Date(video.published_at).toLocaleString("pt-BR") : ""}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Descrição:</p>
          <p className="text-sm">{video.caption || ""}</p>

          <div className="mt-2 space-y-1 text-sm">

          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Hashtags:</p>
          <p>Nenhuma hashtag</p>
        </div>
      </div>
    </div>
  )
}
