"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { SupabaseFallback } from "@/components/supabase-fallback"

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
          console.error("Erro ao obter sessão:", error.message)
          setSupabaseInitialized(false)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          setSupabaseInitialized(true)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao inicializar Supabase:", error)
        setSupabaseInitialized(false)
        setIsLoading(false)
      }
    }

    getSession()

    // Configurar o listener de mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Limpar o listener quando o componente for desmontado
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Forçar navegação para o login
      window.location.href = "/login"
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
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
