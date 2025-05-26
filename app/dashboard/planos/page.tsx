import { createServerClient } from "@/lib/supabase-server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import ClientPageContent from "./client-page-content";

export const metadata: Metadata = {
  title: "Planos - Trend Hack",
  description: "Escolha seu plano de assinatura no Trend Hack",
};

interface SignaturePlan {
  id: string;
  name: string;
  gemas: number;
  signature_value: number; // Renomear para "price" no cliente se necessário para clareza
  signature_id?: string; // Stripe Price ID
}

export default async function PlanosPage() {
  const supabase = await createServerClient();

  // Fetch user to get user ID and check authentication
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if no user
  if (!user) {
    redirect("/login");
  }

  // Fetch available plans from the signature table
  const { data: plansData, error: plansError } = await supabase
    .from('signature')
    .select('id, name, gemas, signature_value, signature_id')
    .order('order', { ascending: true }); // Assumindo que existe uma coluna "order"

  const plans: SignaturePlan[] = plansData || [];

  if (plansError) {
    console.error('Error fetching plans:', plansError);
    // Tratar erro, talvez mostrar uma mensagem ou redirecionar
    // Por simplicidade, logando o erro e passando um array vazio.
  }

  // Fetch available gems for the user
  const { data: userMetricsData, error: userMetricsError } = await supabase
    .from('view_user_metrics')
    .select('gemas_available')
    .eq('user', user.id)
    .single();

  const availableTokens = userMetricsData?.gemas_available || 0; // Default to 0 if data is null or error

  if (userMetricsError) {
    console.error('Error fetching user metrics for plans page:', userMetricsError);
    // Handle error, maybe show a toast or default to 0 tokens
  }

  return <ClientPageContent plans={plans} availableTokens={availableTokens} userId={user.id} />;
} 