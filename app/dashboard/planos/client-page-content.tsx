"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Diamond, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PaymentsHistory from "@/components/payments-history";
import { useAuth } from "@/components/auth-provider";

interface SignaturePlan {
  id: string;
  name: string;
  gemas: number;
  signature_value: number; // Price
  signature_id?: string; // Stripe Price ID
}

interface ClientPageContentProps {
  plans: SignaturePlan[];
  availableTokens: number;
  userId: string;
}

export default function ClientPageContent({ plans, availableTokens, userId }: ClientPageContentProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserClient(); // Use browser client for client-side operations
  const { user } = useAuth();

  const handleSubscribe = async (plan: SignaturePlan) => {
    if (!plan.signature_id) {
      toast({
        title: "Erro ao assinar",
        description: "Este plano não possui um ID de assinatura válido.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPlanId(plan.id);

    try {
      // **TODO: Call your backend API to create a Stripe Checkout session**
      // This is a placeholder. You need to create an API route (e.g., /api/stripe/create-checkout-session)
      // that takes the plan.signature_id and userId, creates a Checkout session with Stripe, and returns the session URL.

      // Example placeholder API call (replace with your actual implementation):
      const response = await fetch('/api/stripe/create-checkout-session', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           priceId: plan.signature_id,
           userId: userId,
           customerEmail: user?.email,
           // Add other necessary data like quantity, metadata, etc.
         }),
      });

      if (!response.ok) {
        const errorData = await response.json();
         throw new Error(errorData.error || "Erro ao criar sessão de checkout.");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url; // Redirecting using window.location is common for Stripe Checkout

    } catch (error: any) {
      console.error("Erro ao iniciar checkout do Stripe:", error);
      toast({
        title: "Erro ao assinar",
        description: error.message || "Não foi possível iniciar o processo de assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Nossos Planos de Assinatura</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col justify-between">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
              <CardDescription>{plan.gemas} gemas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="text-4xl font-bold mb-2">R$ {plan.signature_value.toFixed(2).replace('.', ',')}</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Acesso Imediato</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Análise de Conteúdo</li>
                {/* Adicionar outros benefícios do plano aqui */}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlanId === plan.id}
              >
                 {loadingPlanId === plan.id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                 ) : (
                   "Assinar"
                 )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <PaymentsHistory userId={userId} />
    </div>
  );
} 