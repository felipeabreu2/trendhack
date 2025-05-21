"use client"
import { useEffect, useState } from "react"
import { createClientSupabase } from "@/lib/supabase-client"
import { VideoEstrategia } from "@/components/video-estrategia"
import { VideoGerador } from "@/components/video-gerador"

interface VideoRealtimeProps {
  videoId: string;
  videoAgentId: string;
  analysisStatus: string;
  analysisContent: string;
  simplifiedStatus: string;
  simplifiedContent: string;
  replyStatus: string;
  replyContent: string;
}

export default function VideoRealtime({
  videoId,
  videoAgentId,
  analysisStatus,
  analysisContent,
  simplifiedStatus,
  simplifiedContent,
  replyStatus,
  replyContent,
}: VideoRealtimeProps) {
  const [analysis, setAnalysis] = useState({ status: analysisStatus, content: analysisContent });
  const [simplified, setSimplified] = useState({ status: simplifiedStatus, content: simplifiedContent });
  const [reply, setReply] = useState({ status: replyStatus, content: replyContent });
  const [mode, setMode] = useState<'completa' | 'simplificada'>(analysisStatus === 'complete' ? 'completa' : 'simplificada'); // Inicializa baseado no status completo ou simplificado
  const supabase = createClientSupabase()

  useEffect(() => {
    let ignore = false;
    // A busca inicial agora é feita no server component, então apenas configuramos o realtime

    // Realtime subscription
    const channel = supabase
      .channel(`video_agents_realtime:${videoAgentId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "video_agents", filter: `id=eq.${videoAgentId}` },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (!ignore && payload.new) {
            // Atualiza apenas as colunas analysis e simplified se existirem no payload
            if (payload.new.analysis) {
              setAnalysis(payload.new.analysis);
            }
            if (payload.new.simplified) {
              setSimplified(payload.new.simplified);
            }
            if (payload.new.reply) {
              setReply(payload.new.reply);
            }
          }
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [videoAgentId, supabase]); // Dependências: videoAgentId e supabase

  // Determine o status e conteúdo a ser exibido com base no modo selecionado
  const currentStatus = mode === 'completa' ? analysis.status : simplified.status;
  const currentContent = mode === 'completa' ? analysis.content : simplified.content;

  return (
    <>
      <VideoEstrategia
        videoAgentId={videoAgentId}
        analysisStatus={analysis.status} // Passa o estado interno
        analysisContent={analysis.content} // Passa o estado interno
        simplifiedStatus={simplified.status} // Passa o estado interno
        simplifiedContent={simplified.content} // Passa o estado interno
        onModeChange={setMode}
        currentMode={mode}
      />
      <VideoGerador
        videoAgentId={videoAgentId}
        status={currentStatus}
        content={currentContent}
        replyStatus={reply.status}
        replyContent={reply.content}
      />
    </>
  )
} 