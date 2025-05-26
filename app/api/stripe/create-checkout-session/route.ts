import { NextResponse } from "next/server";
import Stripe from "stripe"; // Uncomment this line
// import { createServerClient } from "@/lib/supabase-server"; // Uncomment this line if needed for database operations in the future

// **TODO: Initialize Stripe with your secret key**
// You need to add your Stripe secret key to your environment variables (e.g., .env.local)
// Certifique-se de que STRIPE_SECRET_KEY está definido em suas variáveis de ambiente.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { // Uncomment and replace with your actual key variable
  apiVersion: "2025-04-30.basil", // Use a versão da API esperada pelo linter
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, userId, customerEmail /*, quantity, metadata... */ } = body;

    // **TODO: Add validation for priceId and userId**
     if (!priceId || !userId) {
       return NextResponse.json({ error: "Missing priceId or userId" }, { status: 400 });
     }

    // **TODO: Create a Stripe Checkout Session**
    // This is the actual Stripe API call. Replace with actual Stripe API call.
    console.log("Received request to create checkout session for:", { priceId, userId });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Ou outros tipos de pagamento que você habilitou no Stripe
      line_items: [
        {
          price: priceId, // O ID do preço do Stripe para o plano
          quantity: 1, // Quantidade da assinatura (geralmente 1 para planos)
        },
      ],
      mode: 'subscription', // Use 'subscription' para planos recorrentes
      success_url: `${req.headers.get('origin')}/dashboard/planos?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/planos?canceled=true`,
      metadata: { // Opcional: Passe dados que você precisa no webhook, como o ID do usuário no seu DB
         userId: userId,
         // Adicione outros metadados relevantes aqui
      },
      customer_email: customerEmail, // Pre-preencher o e-mail do cliente se disponível
    });

    // return NextResponse.json({ url: session.url }); // Uncomment this when using actual Stripe API
    return NextResponse.json({ url: session.url }); // Retorna a URL da sessão de checkout do Stripe

  } catch (error: any) {
    console.error("Error creating Stripe checkout session:", error);
    // Melhorar o tratamento de erro para não expor detalhes internos em produção
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
} 