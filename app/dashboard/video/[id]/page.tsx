import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { VideoHeader } from "@/components/video-header"
import { VideoStats } from "@/components/video-stats"
import { VideoInfo } from "@/components/video-info"
import { VideoTecnicos } from "@/components/video-tecnicos"
import { VideoUrl } from "@/components/video-url"
import { VideoPerfil } from "@/components/video-perfil"
import VideoRealtimeWrapper from "@/components/video-realtime-wrapper"

export const metadata: Metadata = {
  title: "Detalhes do Vídeo - Trend Hack",
  description: "Análise detalhada do vídeo no Trend Hack",
}

// Função utilitária para converter segundos em mm:ss
function formatDuration(seconds: number | string | undefined): string {
  const totalSeconds = Number(seconds) || 0
  const min = Math.floor(totalSeconds / 60)
  const sec = Math.floor(totalSeconds % 60)
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
}

export default async function VideoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()

  // Buscar detalhes do vídeo (incluindo user_request)
  const awaitedParams = await params;
  const { data: video } = await supabase.from("videos").select("*, user_request").eq("id", awaitedParams.id).single()

  if (!video) {
    notFound()
  }

  // Buscar detalhes do perfil na tabela pages usando influencer_id
  let perfilData = null;
  if (video.influencer_id) {
    const { data: page } = await supabase.from("pages").select("*").eq("id", video.influencer_id).single();
    perfilData = page; // Usar os dados da tabela pages se encontrados
  }

  // Buscar nome da plataforma na tabela plataform
  // Se perfilData existe e tem plataform_id, usar plataform_id. Caso contrário, usar video.platform.
  let plataformaNome = video.platform || ""; // Fallback padrão para video.platform
  if (perfilData?.plataform_id) {
    const { data: plataformaDataPages } = await supabase
      .from("plataform")
      .select("name")
      .eq("id", perfilData.plataform_id)
      .single();
    if (plataformaDataPages) {
      plataformaNome = plataformaDataPages.name || plataformaNome; // Usar nome da plataforma de pages se encontrado
    }
  } else {
     // Lógica existente para buscar pela plataforma do vídeo se não houver perfilData ou plataform_id
     const { data: plataformaDataVideo } = await supabase
       .from("plataform")
       .select("name")
       .eq("slug", video.platform)
       .single();
     if (plataformaDataVideo) {
        plataformaNome = plataformaDataVideo.name || plataformaNome; // Usar nome da plataforma do vídeo se encontrado
     }
  }

  // Buscar análise da IA na tabela video_agents
  const { data: agent } = await supabase
    .from("video_agents")
    .select("id, analysis, simplified, reply")
    .eq("video_id", video.id)
    .single()

  // Montar props para VideoTecnicos
  const videoTecnicosProps = {
    plataforma: plataformaNome,
    dimensoes: video.dimensions_width && video.dimensions_height ? `${video.dimensions_width} x ${video.dimensions_height}` : "",
    patrocinado: !!video.is_sponsored,
    tipo_conteudo: video.type || "",
  }

  return (
    <div className="space-y-6">
      <VideoHeader userRequestId={video.user_request} />
      <VideoStats
        stats={{
          visualizacoes: video.views_count || 0,
          curtidas: video.likes_count || 0,
          comentarios: video.comments_count || 0,
          duracao: formatDuration(video.duration),
        }}
      />

      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <div id="info-card" className="flex-1 flex flex-col h-full">
          <VideoInfo video={video} />
          <div className="mt-6">
            <VideoTecnicos video={videoTecnicosProps} />
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end h-full">
          <div className="bg-card rounded-lg p-4 shadow w-full max-w-xs h-full flex flex-col border">
            <h2 className="text-xl font-semibold mb-4 text-left w-full text-foreground">Conteúdo</h2>
            <div className="flex-1 flex items-center justify-center">
              {video.url ? (
                <video
                  controls
                  poster={video.thumbnail_url || "/placeholder.svg"}
                  className="w-full h-full rounded-lg bg-black"
                  style={{ objectFit: 'cover', height: '100%' }}
                >
                  <source src={video.url} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted rounded-lg">
                  Prévia não disponível
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <VideoRealtimeWrapper
          videoId={video.id}
          videoAgentId={agent?.id || ''}
          analysisStatus={agent?.analysis?.status || 'progress'}
          analysisContent={agent?.analysis?.content || ''}
          simplifiedStatus={agent?.simplified?.status || 'false'}
          simplifiedContent={agent?.simplified?.content || ''}
          replyStatus={agent?.reply?.status || 'false'}
          replyContent={agent?.reply?.content || ''}
        />
        <VideoUrl url={video.video_url} />
        <VideoPerfil
          perfil={{
            nome: perfilData?.full_name || video.full_name || "",
            usuario: perfilData?.username ? `@${perfilData?.username}` : (video.username ? `@${video.username}` : ""),
            plataforma: plataformaNome,
            seguidores: perfilData?.followers_count || video.followers_count || 0,
            seguindo: perfilData?.followsCount || video.followsCount || 0,
            avatar: perfilData?.profile_pic_url || video.profile_pic_url || "/placeholder.svg",
          }}
        />
      </div>
    </div>
  )
}
