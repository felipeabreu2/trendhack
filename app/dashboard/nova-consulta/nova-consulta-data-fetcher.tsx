import { createServerClient } from "@/lib/supabase-server";
import { NovaConsultaForm } from "@/components/nova-consulta-form";
import { NovaConsultaResumo } from "@/components/nova-consulta-resumo";
import { useState } from "react";

interface Platform {
  id: string;
  name: string;
  image: string;
  slug: string;
}

interface NovaConsultaFormProps {
  platforms: Platform[];
  plataformTools: any[]; // Ajustar tipo conforme necessário
  onPlatformSelect: (platform: Platform | undefined) => void;
  onExtractionTypeSelect: (type: string | undefined) => void;
}

interface NovaConsultaResumoProps {
  selectedPlatform?: Platform;
  selectedExtractionType?: string;
}

interface NovaConsultaDataFetcherProps {
  // Se necessário passar props do page.tsx para cá no futuro
}

export default async function NovaConsultaDataFetcher(props: NovaConsultaDataFetcherProps) {
  const supabase = await createServerClient();

  const { data: platformsData, error: platformsError } = await supabase
    .from('plataform')
    .select('id, name, image, slug')
    .eq('visible', true);

  const platforms: Platform[] = platformsData || [];

  if (platformsError) {
    // console.error('Error fetching platforms:', platformsError);
  }

  const { data: plataformToolsData, error: toolsError } = await supabase
    .from('plataform_tools')
    .select('id, name, plataform, description, type')
    .eq('visible', true);

  const plataformTools = plataformToolsData || [];

  if (toolsError) {
    // console.error('Error fetching plataform tools:', toolsError);
  }


} 