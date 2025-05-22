"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { SupabaseFallback } from "@/components/supabase-fallback"
import { toast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
  isLoading: boolean
  supabaseInitialized: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  isLoading: true,
  supabaseInitialized: false,
})

// Criar uma única instância do cliente Supabase para todo o aplicativo
const supabase = createBrowserClient()

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [supabaseInitialized, setSupabaseInitialized] = useState(true) // Assume inicializado por padrão
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("AuthProvider: Erro ao obter sessão:", error.message)
          setSupabaseInitialized(false)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          setSupabaseInitialized(true)
        }

        console.log("AuthProvider: getSession finalizado, isLoading = false")
        setIsLoading(false)
      } catch (error) {
        console.error("AuthProvider: Erro ao inicializar Supabase ou obter sessão:", error)
        setSupabaseInitialized(false)
        console.log("AuthProvider: getSession com erro, isLoading = false")
        setIsLoading(false)
      }
    }

    console.log("AuthProvider: Iniciando getSession")
    getSession()

    // Configurar o listener de mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      console.log("AuthProvider: onAuthStateChange disparado, evento:", _event)
      setSession(session)
      setUser(session?.user ?? null)
      console.log("AuthProvider: onAuthStateChange finalizado, isLoading = false")
      setIsLoading(false)
    })

    // Limpar o listener quando o componente for desmontado
    return () => {
      console.log("AuthProvider: Limpando assinatura de autenticação")
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    console.log("AuthProvider: >>> Entrando na função signOut");
    console.log("AuthProvider: Função signOut chamada");
    try {
      console.log("AuthProvider: >>> Tentando logout diretamente com supabase.auth.signOut()");
      // Tentar fazer o logout diretamente com o cliente Supabase no navegador
      const { error } = await supabase.auth.signOut();
      console.log("AuthProvider: <<< Retornou de supabase.auth.signOut()");

      if (error) {
        console.error("AuthProvider: Erro ao fazer logout do Supabase no cliente:", error);
        toast({
          title: "Erro ao fazer logout",
          description: `Ocorreu um erro ao desconectar: ${error.message}`,
          variant: "destructive",
        });
        // Continuar com a limpeza de estado e navegação mesmo em caso de erro no Supabase,
        // pois a sessão pode já estar inválida ou precisarmos forçar a UI a atualizar.
      } else {
        console.log("AuthProvider: Logout do Supabase no cliente bem-sucedido");
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }

      // Limpar estado local no cliente para refletir o logout imediatamente na UI
      setUser(null);
      setSession(null);

      // Usar o router do Next.js para navegar para a página de login no cliente
      // Isso garante a transição da UI.
      router.push("/login");
      console.log("AuthProvider: Redirecionando para /login usando router.push");

    } catch (error) {
      console.error("AuthProvider: Erro inesperado durante o logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  }

  const value = {
    user,
    session,
    signOut,
    isLoading,
    supabaseInitialized,
  }

  if (!supabaseInitialized && !isLoading) {
    return <SupabaseFallback />
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
