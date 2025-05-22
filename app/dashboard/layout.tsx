import type React from "react"
import { Navbar } from "@/components/navbar"
import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto py-6">{children}</div>
    </div>
  )
}
