import { createServerClient } from "@/lib/supabase-server";
import ClientPageContent from "./client-page-content";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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

  // Fetch user to get user ID
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if no user
  if (!user) {
    redirect("/login");
  }

  // Fetch available gems for the user
  const { data: userMetricsData, error: userMetricsError } = await supabase
    .from('view_user_metrics')
    .select('gemas_available')
    .eq('user', user.id)
    .single();

  const availableTokens = userMetricsData?.gemas_available || 0; // Default to 0 if data is null or error

  if (userMetricsError) {
    console.error('Error fetching user metrics:', userMetricsError);
    // Handle error, maybe show a toast or redirect, for now default to 0 tokens
  }

  const { data: platformsData, error: platformsError } = await supabase
    .from('plataform')
    .select('id, name, image, slug')
    .eq('visible', true);

  const platforms: Platform[] = platformsData || [];

  if (platformsError) {
    // console.error('Error fetching platforms:', platformsError);
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
    // console.error('Error fetching plataform tools:', toolsError);
    // Tratar erro na UI, se necessário
  }

  return <ClientPageContent platforms={platforms} plataformTools={plataformTools} availableTokens={availableTokens} />;
}
