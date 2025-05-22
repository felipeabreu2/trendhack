import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards } from "@/components/dashboard-cards"
import { ConsultasList } from "@/components/consultas-list"
import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { DashboardRealtimeWrapper } from "@/components/DashboardRealtimeWrapper"

export const metadata: Metadata = {
  title: "Dashboard - Trend Hack",
  description: "Painel de controle do Trend Hack",
}

export default async function DashboardPage({ searchParams = {} }: { searchParams?: { page?: string } }) {
  const supabase = await createServerClient()

  // Obter usuário autenticado de forma segura
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Paginação
  const pageSize = 6
  // Aguardar searchParams antes de acessar page
  const awaitedSearchParams = await searchParams;
  const currentPage = Number(awaitedSearchParams?.page) > 0 ? Number(awaitedSearchParams.page) : 1
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  // Buscar total de registros para paginação
  const { count: totalCount } = await supabase
    .from("user_request")
    .select("id", { count: "exact", head: true })
    .eq("user", user.id)

  // Buscar requests do usuário paginados
  const { data: userRequests } = await supabase
    .from("user_request")
    .select("*")
    .eq("user", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  // Buscar métricas do usuário na view view_user_metrics
  // REMOVER: A busca de métricas agora é feita em DashboardRealtimeWrapper
  // const { data: metrics } = await supabase
  //   .from("view_user_metrics")
  //   .select("*")
  //   .eq("user", user.id)
  //   .single()

  // Buscar ids de plataformas e tipos
  const plataformaIds = userRequests?.map(r => r.type?.plataform).filter(Boolean) ?? []
  const tipoIds = userRequests?.map(r => r.type?.type).filter(Boolean) ?? []
  const allInfluencerIds = userRequests?.flatMap(r => Array.isArray(r.influencer_id) ? r.influencer_id : (r.influencer_id ? [r.influencer_id] : [])).filter(Boolean) ?? [];
  const uniqueInfluencerIds = Array.from(new Set(allInfluencerIds));

  // Buscar nomes das plataformas (name e image)
  const { data: plataformas } = await supabase
    .from("plataform")
    .select("id, name, image")
    .in("id", plataformaIds)

  // Buscar nomes dos tipos de extração (name)
  const { data: tipos } = await supabase
    .from("plataform_tools")
    .select("id, name")
    .in("id", tipoIds)

  // Buscar dados dos influenciadores (agora da tabela pages, campo profile_pic_url)
  const { data: influenciadores } = await supabase
    .from("pages")
    .select("id, profile_pic_url")
    .in("id", uniqueInfluencerIds)

  // Montar as consultas para o componente
  const consultas = (userRequests ?? []).map(req => {
    const plataformaObj = plataformas?.find(p => p.id === req.type?.plataform)
    const plataforma = plataformaObj?.name ?? "Desconhecida"
    const plataformaImage = plataformaObj?.image ?? "/placeholder.svg"
    const tipo_extracao = tipos?.find(t => t.id === req.type?.type)?.name ?? "Desconhecido"
    return {
      id: req.id,
      perfil: {
        nome: "",
        avatars: (Array.isArray(req.influencer_id) ? req.influencer_id : (req.influencer_id ? [req.influencer_id] : []))
          .map((id: string) => influenciadores?.find(i => i.id === id)?.profile_pic_url || "/placeholder.svg")
          .filter(Boolean), // Filtrar URLs vazias/nulas
      },
      plataforma,
      plataformaImage,
      tipo_extracao,
      status: req.status === 1 ? "Buscando Conteúdos" : req.status === 2 ? "Salvando Conteúdos" : req.status === 3 ? "IA Analisando" : req.status === 4 ? "Analise Concluida" : "Desconhecido",
      statusColor: req.status === 1 ? "blue" : req.status === 2 ? "orange" : req.status === 3 ? "purple" : req.status === 4 ? "green" : "gray",
      tokens: req.gemas,
    }
  })

  // Calcular total de páginas
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 1

  return (
    <div className="space-y-6">
      <DashboardHeader />
      {/* REMOVER: DashboardCards agora é renderizado dentro de DashboardRealtimeWrapper */}
      {/* <DashboardCards
        stats={{
          consultas_concluidas: metrics?.request_complete ?? 0,
          consultas_pendentes: metrics?.request_pending ?? 0,
          gemas_usadas: metrics?.gemas_spent ?? 0,
          gemas_restantes: metrics?.gemas_available ?? 0,
        }}
      /> */}
      {/* Passar consultas, totalPages e currentPage para o wrapper */}
      <DashboardRealtimeWrapper userId={user.id} initialSearchParams={awaitedSearchParams} consultations={consultas} totalPages={totalPages} currentPage={currentPage}/>
    </div>
  )
}
