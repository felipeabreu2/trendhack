import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const cookieStore = cookies() // Obter a store de cookies para este contexto
  const supabase = await createServerClient() // Usar a função que configura callbacks de set/remove

  // Realiza o logout
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Erro ao fazer logout no Route Handler:", error)
    // Opcional: retornar um erro específico, mas o logout do Supabase já limpa o cookie
    // mesmo em caso de erro na comunicação com o Auth server.
  }

  // O Supabase client configurado com os cookies já deve limpar o cookie de sessão.
  // Não precisamos limpar manualmente aqui, a menos que você tenha cookies adicionais.

  // Redireciona para a página de login
  // Usar NextResponse.redirect é a forma recomendada em Route Handlers
  const redirectUrl = new URL('/login', request.url);
  return NextResponse.redirect(redirectUrl);
} 