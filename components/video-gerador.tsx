"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Diamond } from "lucide-react"
import { useTransition } from "react"
import { createClientSupabase } from "@/lib/supabase-client"
import ReactMarkdown from 'react-markdown'
// Assumindo que existe um componente para renderizar markdown com expandir/colapsar
// import MarkdownRendererWithCollapse from "@/components/markdown-renderer-with-collapse";
// Importar componentes de modal (ajuste o caminho conforme sua estrutura)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VideoGeradorProps {
  status: string; // Status do conteúdo (completo/simplificado) - usado para o texto acima do input/resultado
  content: string; // Conteúdo (completo/simplificado) - usado para o texto acima do input/resultado
  videoAgentId: string; // ID do agente para atualizar
  replyStatus: string; // Status da geração de reply
  replyContent: string; // Conteúdo gerado do reply
}

export function VideoGerador({
  status,
  content,
  videoAgentId,
  replyStatus,
  replyContent,
}: VideoGeradorProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, startTransition] = useTransition()
  const supabase = createClientSupabase()
  const [expanded, setExpanded] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false); // Estado para controlar o modal
  const [history, setHistory] = useState<any[]>([]); // Estado para armazenar o histórico

  console.log('VideoGerador - replyStatus:', replyStatus);

  // Função para buscar histórico
  async function fetchHistory() {
    const { data: userSession } = await supabase.auth.getSession();
    const userId = userSession?.session?.user?.id;

    if (userId) {
      const { data, error } = await supabase
        .from('history')
        .select('id, content') // Selecionar colunas relevantes
        .eq('user_id', userId) // Filtrar por user_id (nome da coluna corrigido)
        .order('created_at', { ascending: false }) // Ordenar pelos mais recentes (assumindo created_at)
        .limit(8);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
      } else {
        setHistory(data || []);
      }
    }
  }

  // Handler para o botão Histórico
  async function handleShowHistory() {
    await fetchHistory(); // Buscar histórico antes de abrir
    setShowHistoryModal(true);
  }

  // Handler para selecionar item do histórico
  function handleSelectHistoryItem(content: string) {
    setPrompt(content);
    setShowHistoryModal(false); // Fechar modal ao selecionar
  }

  async function handleReplicar() {
    if (!prompt.trim()) return; // Não faz nada se o input estiver vazio

    startTransition(async () => {
      // 1. Inserir na tabela history
      // Precisamos obter o ID do usuário autenticado. Como estamos em um client component,
      // podemos tentar obter a sessão ou o usuário.
      const { data: userSession } = await supabase.auth.getSession();
      const userId = userSession?.session?.user?.id;

      if (userId) {
        const { error: historyError } = await supabase
          .from('history')
          .insert({
            user_id: userId, // Corrigido para user_id
            content: prompt.trim(),
          });

        if (historyError) {
          console.error('Erro ao inserir no histórico:', historyError);
          // Tratar erro (mostrar mensagem para o usuário, etc.)
        }
      } else {
         console.error('Usuário não autenticado.');
         // Tratar erro (pedir login, etc.)
      }

      // 2. Atualizar a coluna reply e business em video_agents
      const { error: updateError } = await supabase
        .from('video_agents')
        .update({
          reply: { status: 'progress' },
          business: prompt.trim(),
        })
        .eq('id', videoAgentId);

      if (updateError) {
        console.error('Erro ao atualizar video_agents:', updateError);
        // Tratar erro (mostrar mensagem para o usuário, etc.)
      }
    });
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow mt-6">
      <h2 className="text-xl font-semibold mb-4">Gerador de Conteúdo Viral</h2>

      {replyStatus === "false" && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Adaptamos a análise do conteúdo viral acima para o SEU negócio! Descreva abaixo seu produto/serviço/tema e
            criaremos um roteiro viral personalizado seguindo padrões comprovados de engajamento.
          </p>

          {/* Botão Histórico posicionado acima do input */}
          <div className="flex justify-end mb-2"> {/* Ajustar o posicionamento conforme necessário */}
            <Button variant="outline" size="sm" onClick={handleShowHistory}>
              Histórico
            </Button>
          </div>

          {/* Manter a div flexível apenas para o Textarea se necessário para outros ajustes, ou remover */}
          {/* Se não houver outros itens, o Textarea pode ficar sozinho */}
          <Textarea
            placeholder="Escreva aqui o seu produto/serviço/tema"
            className="mb-4" // Revertido para mb-4 se não estiver em flex com outro item
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />

          <div className="flex justify-center">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleReplicar}
              disabled={loading || !prompt.trim()}
            >
              <Diamond className="mr-2 h-4 w-4" />
              Replicar conteúdo viral para o meu nicho
            </Button>
          </div>

          <div className="flex justify-center mt-2">
            <div className="flex items-center text-sm text-gray-500">
              <Diamond className="mr-1 h-3 w-3" />
              <span>1 Token</span>
            </div>
          </div>
        </>
      )}

      {replyStatus === "progress" && (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-sm text-gray-500 text-center">A IA está gerando o seu conteúdo viral...</p>
        </div>
      )}

      {replyStatus === 'complete' && (
        <div className="border rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center w-full">
          {replyContent ? (
            <>
              <div className="prose max-w-none">
                <ReactMarkdown>
                  {expanded ? replyContent : replyContent.split('\n').slice(0, 8).join('\n')}
                </ReactMarkdown>
              </div>
              {replyContent.split('\n').length > 8 && (
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
            <p className="text-sm text-gray-500 text-center">Nenhum conteúdo gerado disponível.</p>
          )}
        </div>
      )}

      {/* Modal de Histórico */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Histórico de Solicitações de Conteúdo Viral </DialogTitle>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto">
            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id} // Usar um ID único para a key
                  className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 mb-2" // Aumentar padding e adicionar margem inferior
                  onClick={() => handleSelectHistoryItem(item.content)}
                >
                  {item.content}
                </div>
              ))
            ) : (
              <p>Nenhum histórico encontrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
