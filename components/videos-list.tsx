"use client"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe } from "lucide-react"

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
  plataformaImage?: string
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
    <div className="bg-card text-card-foreground rounded-lg shadow overflow-hidden border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] text-muted-foreground">
                <Checkbox />
              </TableHead>
              <TableHead className="text-muted-foreground">Conteúdo</TableHead>
              <TableHead className="text-muted-foreground">Perfil</TableHead>
              <TableHead className="text-muted-foreground">Plataforma</TableHead>
              <TableHead className="text-muted-foreground">Duração</TableHead>
              <TableHead className="text-muted-foreground">Visualizações</TableHead>
              <TableHead className="text-muted-foreground">Curtidas</TableHead>
              <TableHead className="text-muted-foreground">Comentários</TableHead>
              <TableHead className="text-muted-foreground">Publicado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayVideos.map((video) => (
              <TableRow
                key={video.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(video.id)}
              >
                <TableCell>
                  <Checkbox onClick={(e) => e.stopPropagation()} />
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <img
                        src={video.conteudo.thumbnail || "/placeholder.svg"}
                        alt={video.conteudo.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate text-foreground">
                        {video.conteudo.titulo.length > 35
                          ? `${video.conteudo.titulo.substring(0, 35)}...`
                          : video.conteudo.titulo}
                      </span>
                      {video.conteudo.url && <span className="text-xs text-muted-foreground truncate">{video.conteudo.url.length > 35
                        ? `${video.conteudo.url.substring(0, 35)}...`
                        : video.conteudo.url}
                      </span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={video.perfil.avatar || "/placeholder.svg"}
                        alt={video.perfil.nome || "Perfil"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis text-foreground">
                        {video.perfil.nome.length > 15 ? `${video.perfil.nome.substring(0, 15)}...` : video.perfil.nome}
                      </p>
                      <p className="text-xs whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
                        @{video.perfil.usuario.length > 15 ? `${video.perfil.usuario.substring(0, 15)}...` : video.perfil.usuario}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex items-center gap-2">
                    <img
                      src={video.plataformaImage || "/placeholder.svg"}
                      alt={video.plataforma}
                      className="w-4 h-4"
                    />
                    <span>{video.plataforma}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{video.duracao}</TableCell>
                <TableCell className="text-foreground">{video.visualizacoes < 0 ? 0 : video.visualizacoes}</TableCell>
                <TableCell className="text-foreground">{video.curtidas < 0 ? 0 : video.curtidas}</TableCell>
                <TableCell className="text-foreground">{video.comentarios < 0 ? 0 : video.comentarios}</TableCell>
                <TableCell className="text-foreground">{video.publicado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
