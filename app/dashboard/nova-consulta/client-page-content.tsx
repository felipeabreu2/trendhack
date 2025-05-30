"use client"

import type { Metadata } from "next"
import { NovaConsultaForm } from "@/components/nova-consulta-form"
import { NovaConsultaResumo } from "@/components/nova-consulta-resumo"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"

interface Platform {
  id: string;
  name: string;
  image: string;
  slug: string;
}

interface PlataformTool {
  id: string;
  name: string;
  plataform: string;
  description: string;
  type?: 'page' | 'url';
  gemas: number;
}

// Definindo a interface para um perfil no estado do formulário
interface ProfileState {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  seguidores?: number;
  seguindo?: number;
  platform_slug?: string; // Adicionar slug da plataforma para fácil acesso
  full_name?: string;
  profile_pic_url?: string;
  followers_count?: number;
  "followsCount"?: number;
  platform?: string;
}

// Remover export const metadata

interface ClientPageContentProps {
  platforms: Platform[];
  plataformTools: PlataformTool[]; // Ajustar tipo conforme necessário
  availableTokens: number; // Adicionar prop para tokens disponíveis
}

// Definir a interface para os dados do resumo
interface SummaryData {
  platformName: string;
  extractionTypeName: string;
  estimatedTime: string;
  costPerResult: number;
  totalCost: number;
  availableTokens: number; // Adicionar tokens disponíveis ao resumo
}

interface NovaConsultaFormProps {
  platforms: Platform[];
  plataformTools: PlataformTool[];
  onPlatformSelect: (platform: Platform | undefined) => void;
  onExtractionTypeSelect: (type: string | undefined) => void;
  selectedProfiles: ProfileState[];
  setSelectedProfiles: React.Dispatch<React.SetStateAction<ProfileState[]>>;
  expectedResults: string;
  setExpectedResults: React.Dispatch<React.SetStateAction<string>>;
  onSummaryUpdate: (summaryData: SummaryData) => void;
  onIniciarConsulta: (periodo: string, periodoUnit: string, resultadosEsperados: string, urlValue: string) => Promise<void>;
}

export default function ClientPageContent({ platforms, plataformTools, availableTokens }: ClientPageContentProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | undefined>(undefined);
  const [selectedExtractionType, setSelectedExtractionType] = useState<string | undefined>(undefined);
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileState[]>([]);
  const [expectedResults, setExpectedResults] = useState<string>("0");
  // Novo estado para armazenar os dados do resumo
  const [summaryData, setSummaryData] = useState<SummaryData>({
    platformName: "",
    extractionTypeName: "",
    estimatedTime: "",
    costPerResult: 0,
    totalCost: 0,
    availableTokens: 0,
  });

  const router = useRouter();
  const { toast } = useToast();

  // Efeito para inicializar o resumo com os tokens disponíveis
  useEffect(() => {
    setSummaryData(prevSummary => ({
      ...prevSummary,
      availableTokens: availableTokens,
    }));
  }, [availableTokens]);

  // Nova função para iniciar a consulta
  const handleIniciarConsulta = useCallback(async (periodo: string, periodoUnit: string, resultadosEsperados: string, urlValue: string) => {
    // console.log("Dados do resumo:", summaryData);

    const supabase = createBrowserClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // console.error("Usuário não autenticado.");
      toast({
        title: "Erro: Usuário não autenticado",
        description: "Por favor, faça login para iniciar uma consulta.",
        variant: "destructive",
      });
      // TODO: Chamar setIsloading(false) aqui
      return;
    }

    // 1. Consultar view_user_metrics para verificar gemas disponíveis
    const { data: userMetricsData, error: userMetricsError } = await supabase
      .from('view_user_metrics') // Usar o nome da view/tabela fornecida
      .select('gemas_available')
      .eq('user', user.id)
      .single();

    if (userMetricsError || !userMetricsData) {
      // console.error("Erro ao buscar métricas do usuário:", userMetricsError);
      toast({
        title: "Erro",
        description: "Não foi possível verificar suas gemas disponíveis. Tente novamente.",
        variant: "destructive",
      });
      // TODO: Chamar setIsloading(false) aqui
      return;
    }

    const gemasAvailable = userMetricsData.gemas_available || 0; // Usar 0 como padrão se null/undefined

    // 2. Comparar gemas disponíveis com o custo total da consulta
    if (gemasAvailable < summaryData.totalCost) {
      // console.error("Gemas insuficientes.");
      toast({
        title: "Gemas insuficientes",
        description: `Você precisa de ${summaryData.totalCost} gemas para esta consulta, mas possui apenas ${gemasAvailable}.`,
        variant: "destructive",
      });
      // TODO: Chamar setIsloading(false) aqui
      return;
    }

    // Se houver gemas suficientes, continuar com a lógica de salvar a user_request
    // A lógica anterior de buscar gemas de users/signature é redundante para a VERIFICAÇÃO de saldo e pode ser removida.
    // No entanto, a linha que define `gemas: summaryData.totalCost` no userRequestData deve permanecer.

    const formattedInfluencerIds = selectedProfiles.map(profile => profile.id);

    let formattedConfiguration = {};

    // Buscar a ferramenta selecionada novamente para obter o ID
    const selectedTool = plataformTools.find(tool => tool.name === selectedExtractionType);

    const formattedType = {
      type: selectedTool?.id, // Usar o ID da ferramenta
      plataform: selectedPlatform?.id, // ID da plataforma
    };

    // Mapear unidade de período do português para o inglês
    const periodUnitMap: { [key: string]: string } = {
      "dias": "days",
      "semanas": "weeks",
      "meses": "months",
      "Anos": "years",
    };

    const englishPeriodUnit = periodUnitMap[periodoUnit] || "days"; // Default para days se não mapeado

    if (selectedPlatform?.slug === 'instagram') {
      const directUrls = selectedProfiles.map(profile => `https://www.instagram.com/${profile.username}/`);

      formattedConfiguration = {
        directUrls: selectedTool?.type === 'url' ? [urlValue] : directUrls, // Se for URL, usar o valor da URL passada
        resultsType: "stories", // Sempre 'stories' para Instagram
        searchLimit: 1,
        resultsLimit: selectedTool?.type === 'page' ? parseInt(resultadosEsperados, 10) : 1, // Usar o valor de resultados esperados passado
        addParentData: false,
        isUserReelFeedURL: false,
        onlyPostsNewerThan: "3 years", // Fixo "3 years" para Instagram
        isUserTaggedFeedURL: false,
        enhanceUserSearchWithFacebookPage: false,
      };
    } else if (selectedPlatform?.slug === 'tiktok' && selectedTool?.type === 'page') { // Adicionar lógica para TikTok page
      const usernames = selectedProfiles.map(profile => profile.username); // Extrair usernames dos perfis selecionados
      const resultsExpectedInt = parseInt(resultadosEsperados, 10) || 0; // Converter resultados esperados para INT

      formattedConfiguration = {
        profiles: usernames, // Array de usernames
        resultsPerPage: resultsExpectedInt, // Quantidade de resultados esperados como INT
        excludePinnedPosts: true,
        shouldDownloadCovers: true,
        shouldDownloadVideos: true,
        shouldDownloadAvatars: true,
        shouldDownloadSubtitles: true,
        shouldDownloadSlideshowImages: true,
        profileScrapeSections: [
          "videos"
        ],
        profileSorting: "latest",
        searchSection: "",
        maxProfilesPerQuery: 1000,
        shouldDownloadMusicCovers: true,
        proxyCountryCode: "None"
      };
    } else if (selectedPlatform?.slug === 'outro_exemplo') {
       // Lógica de formatação para outras plataformas, se houver
    }

    const userRequestData = {
      type: formattedType,
      influencer_id: formattedInfluencerIds,
      configuration: formattedConfiguration,
      gemas: summaryData.totalCost,
      user: user.id,
      // TODO: Adicionar outros campos necessários como status, created_at, etc.
    };

    // console.log("Dados para salvar:", userRequestData);

    const { data, error } = await supabase
      .from('user_request')
      .insert([userRequestData]);

    if (error) {
      // console.error("Erro ao salvar no banco de dados:", error);
      toast({
        title: "Erro ao iniciar consulta",
        description: `Ocorreu um erro ao salvar sua consulta: ${error.message}`,
        variant: "destructive",
      });
      // TODO: Chamar setIsloading(false) aqui
    } else {
      // console.log("Dados salvos com sucesso:", data);
      toast({
        title: "Consulta iniciada com sucesso!",
        description: "Você será redirecionado em breve.",
      });
      router.push("/dashboard");
      // TODO: Mostrar mensagem de sucesso e talvez redirecionar
    }

  }, [selectedPlatform, selectedExtractionType, selectedProfiles, expectedResults, summaryData]); // TODO: Adicionar periodo, periodoUnit, resultadosEsperados e urlValue às dependências se forem usados no corpo do callback de forma que o eslint não detecte

  const handlePlatformSelect = useCallback((platform: Platform | undefined) => {
    setSelectedPlatform(platform);
    // console.log("selectedPlatformName changed:", platform?.name);
  }, [setSelectedPlatform]);

  const handleExtractionTypeSelect = useCallback((type: string | undefined) => {
    setSelectedExtractionType(type);
  }, [setSelectedExtractionType]);

  // Função para receber e atualizar os dados do resumo do NovaConsultaForm
  const handleSummaryUpdate = useCallback((data: SummaryData) => {
    setSummaryData(prevSummary => ({
      ...data, // Mescla os dados recebidos do formulário
      availableTokens: availableTokens, // Sobrescreve availableTokens com o valor da prop
    }));
  }, [setSummaryData, availableTokens]); // Adicionar availableTokens como dependência

  // O cálculo de costDetails no componente pai não é mais necessário, pois o cálculo é feito no formulário
  // No entanto, manteremos uma versão simplificada para passar para NovaConsultaResumo, se necessário, ou ajustar NovaConsultaResumo
  // para receber os dados do summaryData diretamente.
  // Por enquanto, vamos ajustar NovaConsultaResumo para receber summaryData diretamente.

  // O useMemo costDetails pode ser removido ou ajustado para usar summaryData se NovaConsultaResumo ainda precisar desse formato
  const costDetails = useMemo(() => {
    // Podemos adaptar os dados de summaryData para o formato que NovaConsultaResumo espera, ou modificar NovaConsultaResumo
    // Para simplificar, vamos passar summaryData diretamente para NovaConsultaResumo e ajustar lá.
    return {
      costPerResult: summaryData.costPerResult,
      totalProfiles: selectedProfiles.length, // Manter profilesCount se NovaConsultaResumo precisar
      expectedResults: parseInt(expectedResults, 10) || 0, // Manter expectedResults se NovaConsultaResumo precisar
      totalCost: summaryData.totalCost, // Passar o custo total calculado pelo formulário
    };
  }, [summaryData, selectedProfiles.length, expectedResults]);

  useEffect(() => {
    // Calcular e atualizar o resumo no componente pai
    // console.log("Atualizando resumo:", { // Adicionado para depuração
    // console.log('Change received!', payload);
    // console.error('Supabase fetch error:', error);
    // console.error('Error fetching profile:', fetchError);
    // console.error('Error creating profile:', createError);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
      <div className="md:col-span-2">
        <div className="bg-card rounded-lg p-6 shadow border">
          <h1 className="text-2xl font-bold mb-2">Nova Consulta</h1>
          <p className="text-gray-500 mb-6">
            Preencha os dados abaixo para criar uma nova consulta de análise de conteúdo
          </p>
          <NovaConsultaForm
            platforms={platforms} // Usar props
            plataformTools={plataformTools} // Usar props
            onPlatformSelect={handlePlatformSelect}
            onExtractionTypeSelect={handleExtractionTypeSelect}
            selectedProfiles={selectedProfiles}
            setSelectedProfiles={setSelectedProfiles}
            expectedResults={expectedResults}
            setExpectedResults={setExpectedResults}
            // Passar a nova função para atualizar o resumo
            onSummaryUpdate={handleSummaryUpdate}
            onIniciarConsulta={handleIniciarConsulta}
          />
        </div>
      </div>
      <div>
        {/* Passar os dados completos do resumo para NovaConsultaResumo */}
        <NovaConsultaResumo
          summaryData={summaryData}
          selectedPlatform={selectedPlatform} // Manter se NovaConsultaResumo ainda usar
          selectedExtractionType={selectedExtractionType} // Manter se NovaConsultaResumo ainda usar
          // Remover costDetails, pois summaryData já contém o custo total correto
          // costDetails={costDetails}
        />
      </div>
    </div>
  )
} 