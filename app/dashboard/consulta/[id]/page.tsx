import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { ConsultaHeader } from "@/components/consulta-header"
import { ConsultaCards } from "@/components/consulta-cards"
import { VideosList } from "@/components/videos-list"

export const metadata: Metadata = {
  title: "Detalhes da Consulta - Trend Hack",
  description: "Detalhes da consulta no Trend Hack",
}

// Função utilitária para converter segundos em mm:ss
function formatDuration(seconds: number | string | undefined): string {
  const totalSeconds = Number(seconds) || 0
  const min = Math.floor(totalSeconds / 60)
  const sec = Math.floor(totalSeconds % 60)
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
}

export default async function ConsultaPage({
  params,
}: {
  params: { id: string }
}) {
  // Await the dynamic params
  const awaitedParams = await params;

  const supabase = await createServerClient()

  // Buscar detalhes da consulta
  const { data: consulta } = await supabase.from("user_request").select("*").eq("id", awaitedParams.id).single()

  if (!consulta) {
    notFound()
  }

  // Buscar nome do perfil na tabela pages
  let perfilNome = ""
  if (consulta?.influencer_id && Array.isArray(consulta.influencer_id) && consulta.influencer_id[0]) {
    const { data: page } = await supabase
      .from("pages")
      .select("full_name, username")
      .eq("id", consulta.influencer_id[0])
      .single()
    perfilNome = page?.full_name || page?.username || ""
  }

  // Buscar vídeos da consulta
  const { data: videosRaw } = await supabase.from("videos").select("*").eq("user_request", awaitedParams.id)

  // Buscar dados de perfil (pages) e plataforma (plataform) para todos os vídeos
  const influencerIds = videosRaw?.map(v => v.influencer_id).filter(Boolean) ?? []
  const platformsSlugs = videosRaw?.map(v => v.platform).filter(Boolean) ?? []

  const { data: perfis } = await supabase
    .from("pages")
    .select("id, full_name, profile_pic_url, username")
    .in("id", influencerIds)

  const { data: plataformas } = await supabase
    .from("plataform")
    .select("slug, name, image")
    .in("slug", platformsSlugs)

  // Montar array de vídeos para o componente VideosList
  const videos = (videosRaw ?? []).map(video => {
    const perfil = perfis?.find(p => p.id === video.influencer_id)
    const plataforma = plataformas?.find(p => p.slug === video.platform)
    return {
      id: video.id,
      conteudo: {
        thumbnail: video.thumbnail_url || "/placeholder.svg",
        titulo: video.caption?.split("\n")[0] || "",
        url: video.video_url?.split("\n")[0] || "",
      },
      perfil: {
        nome: perfil?.full_name || "",
        avatar: perfil?.profile_pic_url || "/placeholder.svg",
        usuario: perfil?.username || "",
      },
      plataforma: plataforma?.name || video.platform || "",
      plataformaImage: plataforma?.image || undefined,
      duracao: formatDuration(video.duration),
      visualizacoes: video.views_count || 0,
      curtidas: video.likes_count || 0,
      comentarios: video.comments_count || 0,
      publicado: video.published_at ? new Date(video.published_at).toLocaleString("pt-BR") : "",
    }
  })

  return (
    <div className="space-y-6">
      <ConsultaHeader consulta={{ ...consulta, perfil: { nome: perfilNome } }} />
      <ConsultaCards
        stats={{
          visualizacoes: videosRaw?.reduce((sum, video) => sum + (video.views_count || 0), 0) || 0,
          curtidas: videosRaw?.reduce((sum, video) => sum + (video.likes_count || 0), 0) || 0,
          comentarios: videosRaw?.reduce((sum, video) => sum + (video.comments_count || 0), 0) || 0,
          duracao_media: videosRaw?.length
            ? formatDuration(videosRaw.reduce((sum, video) => sum + (Number(video.duration) || 0), 0) / videosRaw.length)
            : formatDuration(0),
        }}
        videoCount={videos?.length || 0}
      />
      <VideosList videos={videos} />
    </div>
  )
}
