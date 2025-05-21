import { createServerClient } from "@/lib/supabase-server";
import ClientPageContent from "./client-page-content";
import { Metadata } from "next";

interface Platform {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export const metadata: Metadata = {
  title: "Nova Consulta - Trend Hack",
  description: "Criar nova consulta no Trend Hack",
};

export default async function NovaConsultaServerPage() {
  const supabase = await createServerClient();

  const { data: platformsData, error: platformsError } = await supabase
    .from('plataform')
    .select('id, name, image, slug')
    .eq('visible', true);

  const platforms: Platform[] = platformsData || [];

  if (platformsError) {
    console.error('Error fetching platforms:', platformsError);
    // Tratar erro na UI, se necessário (redirecionar, mostrar mensagem, etc.)
    // Dependendo da sua necessidade, pode retornar um erro ou um fallback UI aqui.
    // Por simplicidade, estou logando o erro e passando um array vazio.
  }

  const { data: plataformToolsData, error: toolsError } = await supabase
    .from('plataform_tools')
    .select('id, name, plataform, description, type, gemas')
    .eq('visible', true);

  const plataformTools = plataformToolsData || []; // Ajustar tipo conforme necessário

  if (toolsError) {
    console.error('Error fetching plataform tools:', toolsError);
    // Tratar erro na UI, se necessário
  }

  return <ClientPageContent platforms={platforms} plataformTools={plataformTools} />;
}
