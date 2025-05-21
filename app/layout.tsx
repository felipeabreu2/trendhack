import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from "@/components/navbar"
import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sua App',
  description: 'Descrição da sua app',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}