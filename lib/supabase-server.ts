import { createServerClient as createServerClientBase } from "@supabase/ssr"
import { cookies } from "next/headers"

// Define os nomes das cookies
export const cookieName = process.env.SUPABASE_COOKIE_NAME ?? 'sb'

export const createServerClient = async () => {
  const cookieStore = cookies(); // cookies() é assíncrono em Server Components

  return createServerClientBase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => { // get também precisa ser assíncrono
          const store = await cookieStore;
          return store.get(name)?.value;
        },
        set: async (name: string, value: string, options: any) => { // set também precisa ser assíncrono
          const store = await cookieStore;
          try {
             store.set({ name, value, ...options });
          } catch (e) {
             console.error("Failed to set cookie in createServerClient:", e);
          }
        },
        remove: async (name: string, options: any) => { // remove também precisa ser assíncrono
           const store = await cookieStore;
           try {
              store.set({ name, value: "", ...options });
           } catch (e) {
              console.error("Failed to remove cookie in createServerClient:", e);
           }
        },
      },
    }
  );
}

// NOVA FUNÇÃO: Cliente Supabase somente leitura para Server Components
export const createClientReadOnly = async () => {
  const cookieStore = cookies(); // Obter a store de cookies

  return createServerClientBase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const store = await cookieStore;
          return store.get(name)?.value;
        },
        // Não fornecer set e remove para evitar erros em Server Components
        // set: () => {}, // Não adicionar para evitar tentativa de chamada
        // remove: () => {}, // Não adicionar para evitar tentativa de chamada
      },
       // Remover autoRefreshToken e persistSession daqui
       // autoRefreshToken: false, // Desabilitar refresh automático
       // persistSession: false, // Não persistir sessão
    }
  );
};