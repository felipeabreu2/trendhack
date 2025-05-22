"use client"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Instagram } from "lucide-react"

interface Video {
  id: string
  conteudo: {
    thumbnail: string
    titulo: string
    url: string
  }
  perfil: {
    nome: string
    avatar: string
    usuario: string
  }
  plataforma: string
  duracao: string
  visualizacoes: number
  curtidas: number
  comentarios: number
  publicado: string
}

interface VideosListProps {
  videos: Video[]
}

export function VideosList({ videos = [] }: VideosListProps) {
  const router = useRouter()

  // Se não houver vídeos, usamos dados de exemplo
  const exampleVideos: Video[] = []

  const displayVideos = videos.length > 0 ? videos : exampleVideos

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/video/${id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Visualizações</TableHead>
              <TableHead>Curtidas</TableHead>
              <TableHead>Comentários</TableHead>
              <TableHead>Publicado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayVideos.map((video) => (
              <TableRow
                key={video.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(video.id)}
              >
                <TableCell>
                  <Checkbox onClick={(e) => e.stopPropagation()} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={video.conteudo.thumbnail || "/placeholder.svg"}
                        alt={video.conteudo.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate">
                        {video.conteudo.titulo.length > 35
                          ? `${video.conteudo.titulo.substring(0, 35)}...`
                          : video.conteudo.titulo}
                      </span>
                      {video.conteudo.url && <span className="text-xs text-gray-500 truncate">{video.conteudo.url}</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={video.perfil.avatar || "/placeholder.svg"}
                        alt={video.perfil.nome || "Perfil"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {video.perfil.nome.length > 15 ? `${video.perfil.nome.substring(0, 15)}...` : video.perfil.nome}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                        @{video.perfil.usuario.length > 15 ? `${video.perfil.usuario.substring(0, 15)}...` : video.perfil.usuario}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span>{video.plataforma}</span>
                  </div>
                </TableCell>
                <TableCell>{video.duracao}</TableCell>
                <TableCell>{video.visualizacoes < 0 ? 0 : video.visualizacoes}</TableCell>
                <TableCell>{video.curtidas < 0 ? 0 : video.curtidas}</TableCell>
                <TableCell>{video.comentarios < 0 ? 0 : video.comentarios}</TableCell>
                <TableCell>{video.publicado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
