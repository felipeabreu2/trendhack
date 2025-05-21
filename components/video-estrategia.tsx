"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'
import { createClientSupabase } from "@/lib/supabase-client"
import { Diamond } from "lucide-react"

interface VideoEstrategiaProps {
  analysisStatus: string
  analysisContent: string
  simplifiedStatus: string
  simplifiedContent: string
  videoAgentId: string
  onModeChange: (mode: 'completa' | 'simplificada') => void
  currentMode: 'completa' | 'simplificada'
}

export function VideoEstrategia({
  analysisStatus,
  analysisContent,
  simplifiedStatus,
  simplifiedContent,
  videoAgentId,
  onModeChange,
  currentMode,
}: VideoEstrategiaProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, startTransition] = useTransition()
  const supabase = createClientSupabase()

  // Função para acionar simplificação
  async function handleSimplificar() {
    startTransition(async () => {
      await supabase.from('video_agents').update({ simplified: { status: 'progress' } }).eq('id', videoAgentId)
    })
  }

  const lines = analysisContent ? analysisContent.split('\n') : []
  const preview = lines.slice(0, 8).join('\n')
  const hasMore = lines.length > 8

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Estratégia Viral do Conteúdo</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full ${currentMode === 'completa' ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}`}
            onClick={() => onModeChange('completa')}
          >
            Completa
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full ${currentMode === 'simplificada' ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}`}
            onClick={() => onModeChange('simplificada')}
          >
            Simplificado
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center">
        {/* COMPLETA: status progress */}
        {currentMode === 'completa' && analysisStatus === 'progress' && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
            <p className="text-sm text-gray-500 text-center">A IA está gerando a Estratégia Viral do Conteúdo...</p>
          </div>
        )}
        {/* COMPLETA: status complete */}
        {currentMode === 'completa' && analysisStatus === 'complete' && (
          <div className="w-full">
            {analysisContent ? (
              <>
                <ReactMarkdown>
                  {expanded ? analysisContent : analysisContent.split('\n').slice(0, 8).join('\n')}
                </ReactMarkdown>
                {analysisContent.split('\n').length > 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 mx-auto block"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? 'Ver menos' : 'Ver mais'}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center">Nenhum conteúdo disponível.</p>
            )}
          </div>
        )}
        {/* SIMPLIFICADO: status false */}
        {currentMode === 'simplificada' && simplifiedStatus === 'false' && (
          <div className="flex flex-col items-center justify-center w-full">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              disabled={loading}
              onClick={handleSimplificar}
            >
              <Diamond className="mr-2 h-4 w-4" />
              Simplificar e Resumir Estratégia Viral
            </Button>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <Diamond className="mr-1 h-3 w-3" />
              <span>1 Gema</span>
            </div>
          </div>
        )}
        {/* SIMPLIFICADO: status progress */}
        {currentMode === 'simplificada' && simplifiedStatus === 'progress' && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
            <p className="text-sm text-gray-500 text-center">A IA está simplificando e resumindo a Estratégia Viral...</p>
          </div>
        )}
        {/* SIMPLIFICADO: status complete */}
        {currentMode === 'simplificada' && simplifiedStatus === 'complete' && (
          <div className="w-full">
            {simplifiedContent ? (
              <>
                <ReactMarkdown>
                  {expanded ? simplifiedContent : simplifiedContent.split('\n').slice(0, 8).join('\n')}
                </ReactMarkdown>
                {simplifiedContent.split('\n').length > 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 mx-auto block"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? 'Ver menos' : 'Ver mais'}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center">Nenhum conteúdo disponível.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
