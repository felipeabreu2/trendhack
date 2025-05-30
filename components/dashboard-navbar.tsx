"use client"

import { LayoutDashboard, PlusCircle, Diamond } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function DashboardNavbar() {
  const navItems = [
    { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { name: 'Nova Consulta', url: '/dashboard/nova-consulta', icon: PlusCircle },
    { name: 'Tokens', url: '/dashboard/planos', icon: Diamond },
  ]

  return <NavBar items={navItems} />
} 