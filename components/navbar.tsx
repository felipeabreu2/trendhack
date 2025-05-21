"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PlusCircle, Settings, LogOut, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut, isLoading } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-purple-600">Trend Hack</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard">
                <Button variant={isActive("/dashboard") ? "default" : "ghost"} className="rounded-full">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/nova-consulta">
                <Button variant={isActive("/dashboard/nova-consulta") ? "default" : "ghost"} className="rounded-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nova Consulta
                </Button>
              </Link>
              <Link href="/dashboard/admin">
                <Button variant={isActive("/dashboard/admin") ? "default" : "ghost"} className="rounded-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center">
              <span className="font-medium">105</span>
            </div>

            {isLoading ? (
              <Button variant="ghost" size="icon" disabled className="h-8 w-8 rounded-full">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-800">
                      {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.user_metadata?.name || "Usuário"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
