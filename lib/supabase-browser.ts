import { createBrowserClient as createBrowserSupabaseClient } from "@supabase/ssr"

// Variável para armazenar a instância singleton
let supabaseInstance: ReturnType<typeof createBrowserSupabaseClient> | null = null

export const createBrowserClient = (): ReturnType<typeof createBrowserSupabaseClient> => {
  // Se já existe uma instância, retorna ela
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseInstance = createBrowserSupabaseClient(
    supabaseUrl,
    supabaseAnonKey
  )

  return supabaseInstance
}
