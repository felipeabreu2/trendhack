"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Globe } from "lucide-react"
import { VideosList } from "@/components/videos-list"

interface Consulta {
  id: string
  perfil: {
    nome: string
    avatars: string[]
  }
  plataforma: string
  plataformaImage: string; // Adicionar plataformaImage
  tipo_extracao: string
  status: string
  tokens: number
  statusColor: string
}

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
  plataformaImage?: string; // Adicionar plataformaImage (opcional)
  duracao: string
  visualizacoes: number
  curtidas: number
  comentarios: number
  publicado: string
}

interface ConsultasListProps {
  consultas: Consulta[]
  videos: Video[]; // Usar a interface Video
  totalPages?: number
  currentPage?: number
  // Remover activeTab daqui
  // activeTab?: "consultas" | "videos"
  // Adicionar prop para a aba ativa, gerenciada pelo pai
  activeTab: "consultas" | "videos"
  onTabChange: (tab: "consultas" | "videos") => void; // Adicionar callback para mudança de aba
}

// Remover state activeTab e lógica de handleRowClick baseada no state
export function ConsultasList({ consultas = [], totalPages = 1, currentPage = 1, videos = [], activeTab, onTabChange }: ConsultasListProps) {
  const router = useRouter()
  // Remover estado local de activeTab
  // const [activeTab, setActiveTab] = useState<"consultas" | "videos">("consultas")

  // Se não houver consultas/videos (dependendo da aba ativa), usamos dados de exemplo (opcional, manter por enquanto se útil para fallback visual)
  const exampleConsultas: Consulta[] = []
  const exampleVideos: Video[] = [] // Adicionar exemplo para vídeos

  // Usar os dados passados via prop, com fallback para exemplos se as listas estiverem vazias
  const displayConsultas = consultas.length > 0 ? consultas : exampleConsultas;
  const displayVideos = videos.length > 0 ? videos : exampleVideos;

  // Ajustar handleRowClick para usar a prop activeTab
  const handleRowClick = (id: string) => {
    if (activeTab === "consultas") {
      router.push(`/dashboard/consulta/${id}`)
    } else if (activeTab === "videos") {
      router.push(`/dashboard/video/${id}`)
    }
  }

  return (
    <div className="bg-background rounded-lg shadow overflow-hidden border">
      <div className="p-6">
        {/* Usar a prop activeTab para o título */}
        <h2 className="text-xl font-semibold mb-4 text-foreground">Histórico de {activeTab === "consultas" ? "consultas" : "vídeos"}</h2>

        <div className="flex justify-end mb-4">
          <div className="bg-muted rounded-full p-1 flex">
            <Button
              variant="ghost"
              className={`rounded-full ${activeTab === "consultas" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              // Usar o callback onTabChange
              onClick={() => onTabChange("consultas")}
            >
              Consultas
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full ${activeTab === "videos" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              // Usar o callback onTabChange
              onClick={() => onTabChange("videos")}
            >
              Vídeos
            </Button>
          </div>
        </div>

        {/* Renderizar condicionalmente com base na prop activeTab */}
        {activeTab === "consultas" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-muted-foreground">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="text-muted-foreground">Perfil</TableHead>
                  <TableHead className="text-muted-foreground">Plataforma</TableHead>
                  <TableHead className="text-muted-foreground">Tipo de Extração</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayConsultas.map((consulta) => (
                  <TableRow
                    key={consulta.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(consulta.id)}
                  >
                    <TableCell>
                      <Checkbox onClick={(e) => e.stopPropagation()} />
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {Array.isArray(consulta.perfil.avatars) && consulta.perfil.avatars.map((avatarUrl, index) => {
                            if (typeof avatarUrl === 'string' && avatarUrl.length > 0) {
                              return (
                                <div key={index} className="inline-block h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                  <img
                                    src={avatarUrl}
                                    alt={`Perfil ${index}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              );
                            } else {
                              return null;
                            }
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        {/* Usar a imagem da plataforma se disponível, fallback para ícone */}
                        {consulta.plataformaImage ? (
                           <img src={consulta.plataformaImage} alt={consulta.plataforma} className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span>{consulta.plataforma}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        <span>{consulta.tipo_extracao}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        `
                        ${consulta.statusColor === 'blue' ? 'bg-blue-500 text-white dark:bg-blue-700' : // Azul para 'Buscando Conteúdos'
                         consulta.statusColor === 'orange' ? 'bg-orange-500 text-white dark:bg-orange-700' : // Laranja para Pendente (se houver)
                         consulta.statusColor === 'purple' ? 'bg-purple-500 text-white dark:bg-purple-700' : // Roxo para Analisando
                         consulta.statusColor === 'green' ? 'bg-green-500 text-white dark:bg-green-700' : // Verde para Concluída
                         'bg-gray-500 text-white dark:bg-gray-700'} // Cinza para Desconhecido/Nenhum Conteúdo
                        hover:opacity-80
                        `} 
                      >
                        {consulta.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-foreground">{consulta.tokens}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "videos" && (
          <VideosList videos={displayVideos} />
        )}

        {/* Paginação (exibir para ambas as abas) */}
        {totalPages > 1 && ( // Exibir paginação apenas se houver mais de uma página
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              // A ação de mudança de página já está no DashboardRealtimeWrapper via router.push
              onClick={() => router.push(`?page=${currentPage - 1}`)}
              className="text-foreground border-border hover:bg-muted"
            >
              Anterior
            </Button>
            {/* Renderização dos botões de página */}
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                // A ação de mudança de página já está no DashboardRealtimeWrapper via router.push
                onClick={() => router.push(`?page=${i + 1}`)}
                className={currentPage === i + 1 ? "" : "text-foreground border-border hover:bg-muted"}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              // A ação de mudança de página já está no DashboardRealtimeWrapper via router.push
              onClick={() => router.push(`?page=${currentPage + 1}`)}
              className="text-foreground border-border hover:bg-muted"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 