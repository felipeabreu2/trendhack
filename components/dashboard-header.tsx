"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PlusCircle, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

export function DashboardHeader() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo ao seu painel de controle</p>
      </div>
    </div>
  )
}
