import type React from "react"

import { createClientReadOnly } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { BGPattern } from "@/components/ui/bg-pattern"
import { AuthProvider } from "@/components/auth-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClientReadOnly()
  const { data: { user }, } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login")
  }

  return (
    <AuthProvider>
      <div className="min-h-screen relative">
        <BGPattern variant="grid" mask="fade-edges" />

        <header className="fixed top-4 left-0 right-0 z-10 w-full">
          <DashboardNavbar />
        </header>

        <div className="container mx-auto py-6 pt-20">{children}</div>
      </div>
    </AuthProvider>
  )
}
