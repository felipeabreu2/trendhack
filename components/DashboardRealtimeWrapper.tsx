"use client"

import { useState, useEffect } from "react";
import { createClientSupabase } from "@/lib/supabase-client";
import { ConsultasList } from "@/components/consultas-list";
import { useRouter } from "next/navigation";
import { Stats } from "./ui/stats";

interface DashboardRealtimeWrapperProps {
  userId: string;
  initialSearchParams: { page?: string };
  consultations: Consulta[];
  totalPages: number;
  currentPage: number;
  initialStats: DashboardStats; // Adicionar prop para as métricas iniciais
}

interface Consulta {
  id: string;
  perfil: {
    nome: string;
    avatars: string[];
  };
  plataforma: string;
  plataformaImage: string;
  tipo_extracao: string;
  status: string;
  tokens: number;
  statusColor: string;
}

interface DashboardStats {
  consultas_concluidas: number;
  consultas_pendentes: number;
  gemas_usadas: number;
  gemas_restantes: number;
}

export function DashboardRealtimeWrapper({
  userId,
  initialSearchParams,
  consultations: initialConsultations,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
  initialStats, // Receber métricas iniciais
}: DashboardRealtimeWrapperProps) {
  const supabase = createClientSupabase();
  const router = useRouter();
  const [consultas, setConsultas] = useState<Consulta[]>(initialConsultations);
  const [videos, setVideos] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [stats, setStats] = useState<DashboardStats>(initialStats); // Usar métricas iniciais

  const pageSize = 6; // Manter o tamanho da página definido anteriormente

  useEffect(() => {
    // A busca inicial de consultas e métricas é feita no Server Component e passada como prop.
    // Esta função agora só será usada para refetch em caso de update via Realtime.
    const refetchConsultationsAndStats = async () => {
      const awaitedSearchParams = await initialSearchParams;
      const page = Number(awaitedSearchParams?.page) > 0 ? Number(awaitedSearchParams.page) : initialCurrentPage;
      setCurrentPage(page);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Buscar total de registros para paginação de CONSULTAS
      const { count: totalCountConsultas } = await supabase
        .from("user_request")
        .select("id", { count: "exact", head: true })
        .eq("user", userId);

      // Buscar requests do usuário paginados
      const { data: userRequests } = await supabase
        .from("user_request")
        .select("*", { count: 'exact' }) // Manter count: 'exact' se a paginação for baseada no count total aqui (improvável com dados iniciais)
        .eq("user", userId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (userRequests) {
        // Mapear dados para o formato da interface Consulta (manter lógica de app/dashboard/page.tsx)
        const plataformaIds = userRequests?.map(r => r.type?.plataform).filter(Boolean) ?? []
        console.log('DashboardRealtimeWrapper: userRequests fetched', userRequests);
        console.log('DashboardRealtimeWrapper: extracted plataformaIds', plataformaIds);
        const tipoIds = userRequests?.map(r => r.type?.type).filter(Boolean) ?? []
        const allInfluencerIds = userRequests?.flatMap(r => Array.isArray(r.influencer_id) ? r.influencer_id : (r.influencer_id ? [r.influencer_id] : [])).filter(Boolean) ?? [];
        const uniqueInfluencerIds = Array.from(new Set(allInfluencerIds));

        const { data: plataformas } = await supabase
          .from("plataform")
          .select("id, name, image")
          .in("id", plataformaIds)

        console.log('DashboardRealtimeWrapper: plataformas fetched', plataformas);

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

        const mappedConsultas = userRequests.map(req => {
            const plataformaObj = plataformas?.find(p => p.id === req.type?.plataform)
            const plataforma = plataformaObj?.name ?? "Desconhecida"
            const plataformaImage = plataformaObj?.image ?? "/placeholder.svg"
            
            console.log(`DashboardRealtimeWrapper: Mapping request ${req.id} - Plataform ID: ${req.type?.plataform}, Plataform Data:`, plataformaObj);
            console.log(`DashboardRealtimeWrapper: Mapped consulta ${req.id} - plataformaImage: ${plataformaImage}`);

            // Mapear influencer_id(s) para profile_pic_url(s) e criar o array de arrays
            const avatarsArray = (Array.isArray(req.influencer_id) ? req.influencer_id : (req.influencer_id ? [req.influencer_id] : []))
              .map((id: string) => influenciadores?.find(i => i.id === id)?.profile_pic_url || "/placeholder.svg")
              .filter(Boolean); // Filtrar URLs vazias/nulas

            // Mapeamento de status e cor
            let statusText = "Desconhecido";
            let statusColor = "gray";

            switch(req.status) {
                case 1:
                    statusText = "Buscando Conteúdos";
                    statusColor = "blue";
                    break;
                case 2:
                    statusText = "Salvando Conteúdos";
                    statusColor = "orange";
                    break;
                case 3:
                    statusText = "IA Analisando";
                    statusColor = "purple";
                    break;
                case 4:
                    statusText = "Analise Concluida";
                    statusColor = "green";
                    break;
                case 5:
                    statusText = "Nenhum Conteúdo";
                    statusColor = "gray";
                    break;
                default:
                    statusText = "Desconhecido";
                    statusColor = "gray";
            }

            return {
                id: req.id,
                perfil: {
                    nome: "", // O nome do perfil não está vindo na query, manter vazio por enquanto
                    avatars: avatarsArray,
                },
                plataforma,
                plataformaImage,
                tipo_extracao: tipos?.find(t => t.id === req.type?.type)?.name ?? "Desconhecido",
                status: statusText,
                statusColor,
                tokens: req.gemas,
            };
        });
        setConsultas(mappedConsultas);
        // Atualizar totalPages APÓS buscar consultas (isso sobrescreverá o totalPages de consultas quando a aba de vídeo for ativa)
        const totalPagesCount = totalCountConsultas ? Math.ceil(totalCountConsultas / pageSize) : 1;
        setTotalPages(totalPagesCount);
      }

      // Buscar métricas do usuário na view view_user_metrics
      const { data: metrics, error: metricsError } = await supabase
        .from("view_user_metrics")
        .select("*")
        .eq("user", userId)
        .single();

      if (metricsError) {
        console.error("Erro ao buscar métricas em tempo real:", metricsError);
      } else if (metrics) {
        setStats({
          consultas_concluidas: metrics?.request_complete ?? 0,
          consultas_pendentes: metrics?.request_pending ?? 0,
          gemas_usadas: metrics?.gemas_spent ?? 0,
          gemas_restantes: metrics?.gemas_available ?? 0,
        });
      }
    };

    const fetchRecentVideos = async () => {
      const awaitedSearchParams = await initialSearchParams; // Obter searchParams para paginação de vídeos
      const page = Number(awaitedSearchParams?.page) > 0 ? Number(awaitedSearchParams.page) : initialCurrentPage; // Página atual para vídeos
      // setCurrentPage(page); // Não atualizar currentPage global aqui, pois fetchInitialData já faz isso
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Buscar total de registros para paginação de VÍDEOS
       const { count: totalCountVideos } = await supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("user", userId);

      // 1. Buscar vídeos com paginação
      const { data: videosRaw, error: videosError } = await supabase
        .from("videos")
        .select(`
          *,
          perfil:pages(full_name, username, profile_pic_url)
        `)
        .eq("user", userId)
        .order("created_at", { ascending: false })
        .range(from, to); // Aplicar range para paginação

      if (videosError) {
        // console.error("Erro ao buscar vídeos recentes:", videosError);
        setVideos([]);
        return; // Sair da função se houver erro na primeira query
      }

      if (videosRaw && videosRaw.length > 0) {
        // 2. Extrair slugs de plataforma únicos
        const platformsSlugs = [...new Set(videosRaw.map(video => video.platform).filter(Boolean))];

        // 3. Buscar dados das plataformas com base nos slugs
        let plataformas: any[] | null = [];
        if (platformsSlugs.length > 0) {
          const { data: plataformasData, error: plataformasError } = await supabase
            .from("plataform")
            .select("slug, name, image")
            .in("slug", platformsSlugs);
          
          if (plataformasError) {
            // console.error("Erro ao buscar dados das plataformas:", plataformasError);
            // Continuar mesmo com erro, mas sem os dados da plataforma
          } else {
            plataformas = plataformasData;
          }
        }

        // 4. Mapear vídeos e juntar dados da plataforma manualmente
        const mappedVideos = videosRaw.map(video => {
            const perfil = video.perfil; // Perfil já está embedado
            const plataformaObj = plataformas?.find(p => p.slug === video.platform); // Encontrar plataforma correspondente

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
                plataforma: plataformaObj?.name || video.platform || "", // Usar nome da plataforma encontrada ou slug
                plataformaImage: plataformaObj?.image || undefined, // Usar imagem da plataforma encontrada
                duracao: formatDuration(video.duration),
                visualizacoes: video.views_count || 0,
                curtidas: video.likes_count || 0,
                comentarios: video.comments_count || 0,
                publicado: video.published_at ? new Date(video.published_at).toLocaleString("pt-BR") : "",
            };
        });

        setVideos(mappedVideos);

        // Atualizar totalPages APÓS buscar vídeos (isso sobrescreverá o totalPages de consultas quando a aba de vídeo for ativa)
        const totalPagesCount = totalCountVideos ? Math.ceil(totalCountVideos / pageSize) : 1;
        setTotalPages(totalPagesCount);

      } else {
         setVideos([]);
          // Atualizar totalPages mesmo que não haja vídeos
          const totalPagesCount = totalCountVideos ? Math.ceil(totalCountVideos / pageSize) : 1;
          setTotalPages(totalPagesCount);
      }
    };

    // Chamar fetchRecentVideos no carregamento inicial
    fetchRecentVideos();

    // Configurar assinatura em tempo real para user_request (agora apenas para refetch)
    const subscription = supabase
      .channel(`user_requests:user=eq.${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_request', filter: `user=eq.${userId}` },
        (payload) => {
          console.log('User request change received!', payload);
          // Refetch os dados da página atual em caso de qualquer mudança relevante
          refetchConsultationsAndStats();
        }
      )
      .subscribe();

    // Configurar assinatura em tempo real para videos (opcional, para atualizações granulares)
    const videoSubscription = supabase
      .channel(`videos:user=eq.${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'videos', filter: `user=eq.${userId}` },
        (payload) => {
          console.log('Video change received!', payload);
          // Refetch os dados dos vídeos recentes em caso de mudança
          fetchRecentVideos();
        }
      )
      .subscribe();

    // Limpar assinatura ao desmontar o componente
    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(videoSubscription);
    };
  }, [userId, initialSearchParams, supabase, pageSize]); // Adicionar dependências

  // Função utilitária para converter segundos em mm:ss (mover para fora do useEffect)
  const formatDuration = (seconds: number | string | undefined): string => {
    const totalSeconds = Number(seconds) || 0;
    const min = Math.floor(totalSeconds / 60);
    const sec = Math.floor(totalSeconds % 60);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Manusear mudança de página (já existe em ConsultasList, mas replicar aqui para controle)
  // Esta função não é mais necessária aqui, pois ConsultasList lida com isso internamente via router.
  // No entanto, se a paginação for controlada pelo wrapper, ela seria usada aqui.
  // const handlePageChange = (page: number) => {
  //   router.push(`?page=${page}`);
  // };

  return (
    <div className="space-y-6">
      <Stats stats={stats} />
      <ConsultasList
        consultas={consultas} // Usar o estado local atualizado via realtime/refetch
        videos={videos}
        totalPages={totalPages} // totalPages refletirá o total da última busca (consultas ou vídeos)
        currentPage={currentPage}
        // ConsultasList já usa o router para mudar a página, então não precisamos passar handlePageChange
      />
    </div>
  );
} 