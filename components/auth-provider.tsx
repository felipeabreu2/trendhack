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
  const [supabaseInitialized, setSupabaseInitialized] = useState(true)
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
    } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      console.log("AuthProvider: onAuthStateChange disparado, evento:", event)
      
      // Atualizar o estado baseado no evento
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
        
        // Se foi um logout, redirecionar para login
        if (event === 'SIGNED_OUT') {
          console.log("AuthProvider: Usuário deslogado, redirecionando para /login")
          router.push("/login")
        }
      }
      
      console.log("AuthProvider: onAuthStateChange finalizado")
    })

    // Limpar o listener quando o componente for desmontado
    return () => {
      console.log("AuthProvider: Limpando assinatura de autenticação")
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    console.log("AuthProvider: >>> Entrando na função signOut")
    
    try {
      // Definir loading como true durante o processo de logout
      setIsLoading(true)
      
      console.log("AuthProvider: >>> Tentando logout com supabase.auth.signOut()")
      
      // Fazer logout do Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Remove apenas a sessão local
      })
      
      console.log("AuthProvider: <<< Retornou de supabase.auth.signOut()")

      if (error) {
        console.error("AuthProvider: Erro ao fazer logout do Supabase:", error)
        
        // Forçar limpeza do estado mesmo com erro
        setUser(null)
        setSession(null)
        setIsLoading(false)
        
        toast({
          title: "Aviso",
          description: "Sessão limpa localmente. Redirecionando...",
          variant: "default",
        })
        
        // Redirecionar mesmo com erro
        router.push("/login")
      } else {
        console.log("AuthProvider: Logout do Supabase bem-sucedido")
        
        // O onAuthStateChange vai lidar com a limpeza do estado e redirecionamento
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        })
      }

    } catch (error) {
      console.error("AuthProvider: Erro inesperado durante o logout:", error)
      
      // Forçar limpeza em caso de erro inesperado
      setUser(null)
      setSession(null)
      setIsLoading(false)
      
      toast({
        title: "Erro ao fazer logout",
        description: "Erro inesperado, mas sessão foi limpa.",
        variant: "destructive",
      })
      
      // Redirecionar mesmo com erro
      router.push("/login")
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