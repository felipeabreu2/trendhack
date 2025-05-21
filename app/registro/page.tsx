import type { Metadata } from "next"
import Link from "next/link"
import { RegistroForm } from "@/components/registro-form"

export const metadata: Metadata = {
  title: "Registro - Trend Hack",
  description: "Crie sua conta no Trend Hack",
}

export default function RegistroPage() {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Trend Hack
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Trend Hack revolucionou minha estratégia de conteúdo. Agora consigo entender o que realmente funciona nas
              redes sociais."
            </p>
            <footer className="text-sm">Carlos Oliveira</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Crie sua conta</h1>
            <p className="text-sm text-muted-foreground">Preencha os dados abaixo para criar sua conta</p>
          </div>
          <RegistroForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
