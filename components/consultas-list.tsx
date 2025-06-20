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
  plataformaImage?: string
  tipo_extracao: string
  status: string
  tokens: number
  statusColor: string
}

interface VideosListProps {
  videos: any[];
}

interface ConsultasListProps {
  consultas: Consulta[]
  totalPages?: number
  currentPage?: number
  videos: VideosListProps['videos']
}

export function ConsultasList({ consultas = [], totalPages = 1, currentPage = 1, videos = [] }: ConsultasListProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"consultas" | "videos">("consultas")

  // Se não houver consultas, usamos dados de exemplo
  const exampleConsultas: Consulta[] = []

  const displayConsultas = consultas.length > 0 ? consultas : exampleConsultas

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
        <h2 className="text-xl font-semibold mb-4 text-foreground">Histórico de {activeTab === "consultas" ? "consultas" : "vídeos"}</h2>

        <div className="flex justify-end mb-4">
          <div className="bg-muted rounded-full p-1 flex">
            <Button
              variant="ghost"
              className={`rounded-full ${activeTab === "consultas" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("consultas")}
            >
              Consultas
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full ${activeTab === "videos" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("videos")}
            >
              Vídeos
            </Button>
          </div>
        </div>

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
                        <img
                          src={consulta.plataformaImage || "/placeholder.svg"}
                          alt={consulta.plataforma}
                          className="w-4 h-4"
                        />
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
          <VideosList videos={videos} />
        )}

        {/* Paginação (exibir para ambas as abas) */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => router.push(`?page=${currentPage - 1}`)}
              className="text-foreground border-border hover:bg-muted"
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
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
