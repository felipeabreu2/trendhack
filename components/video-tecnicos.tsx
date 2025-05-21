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
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Detalhes Técnicos</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Plataforma:</p>
          <p>{video.plataforma || "Instagram"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Dimensões:</p>
          <p>{video.dimensoes || "640 x 1136"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Patrocinado:</p>
          <p>{video.patrocinado ? "Sim" : "Não"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Tipo de conteúdo:</p>
          <p>{video.tipo_conteudo || "Vídeo"}</p>
        </div>
      </div>
    </div>
  )
}
