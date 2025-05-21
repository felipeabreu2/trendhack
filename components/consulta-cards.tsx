import { Eye, Heart, MessageCircle, Clock } from "lucide-react"

interface ConsultaCardsProps {
  stats: {
    visualizacoes: number
    curtidas: number
    comentarios: number
    duracao_media: string
  }
  videoCount: number
}

export function ConsultaCards({ stats, videoCount }: ConsultaCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Total de Visualizações</p>
            <h2 className="text-4xl font-bold">{stats.visualizacoes}</h2>
            <p className="text-sm text-gray-500">Em {videoCount} vídeos</p>
          </div>
          <div className="bg-gray-100 p-2 rounded-full">
            <Eye className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Total de Curtidas</p>
            <h2 className="text-4xl font-bold">{stats.curtidas}</h2>
            <p className="text-sm text-gray-500">
              Taxa de curtidas: {Math.round((stats.curtidas / (videoCount || 1)) * 100)}%
            </p>
          </div>
          <div className="bg-red-100 p-2 rounded-full">
            <Heart className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Total de Comentários</p>
            <h2 className="text-4xl font-bold">{stats.comentarios}</h2>
            <p className="text-sm text-gray-500">
              Taxa de comentários: {Math.round((stats.comentarios / (videoCount || 1)) * 100)}%
            </p>
          </div>
          <div className="bg-green-100 p-2 rounded-full">
            <MessageCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Média de Duração</p>
            <h2 className="text-4xl font-bold">{stats.duracao_media}</h2>
            <p className="text-sm text-gray-500">Baseado nos {videoCount} vídeos</p>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
