"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon, Sun, Moon, Monitor, LayoutDashboard, PlusCircle, Settings, LogOut, Loader2, Diamond, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import React from "react"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const { user, signOut, isLoading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = async () => {
    console.log("Navbar: handleLogout chamada");
    try {
      console.log("Navbar: >>> Tentando logout com signOut()");
      await signOut();
      console.log("Navbar: <<< Retornou de signOut()");
    } catch (error) {
      console.error("Navbar: Erro no handleLogout:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className={cn("flex justify-center py-1", className)}>
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="rounded-full">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[200px] sm:w-[250px] z-[100]">
            <nav className="flex flex-col gap-4">
              {items.map((item) => (
                <React.Fragment key={item.url}>
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                      pathname === item.url &&
                        "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    )}
                    onClick={() => setIsMobile(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </React.Fragment>
              ))}
              {user && (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 w-full justify-start"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Sair
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="inline-flex items-center gap-2 bg-background/80 border border-border backdrop-blur-lg py-2 px-3 rounded-full shadow-lg min-w-0 shrink-0 pointer-events-auto">
          <nav className="inline-flex items-center space-x-1">
            {items.map((item) => (
              <React.Fragment key={item.url}>
                <Link href={item.url}>
                  <Button
                    variant={isActive(item.url) ? "secondary" : "ghost"}
                    className="rounded-full whitespace-nowrap"
                    size="sm"
                  >
                    {item.name}
                  </Button>
                </Link>
              </React.Fragment>
            ))}
          </nav>
          <div className="inline-flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

NavBar.displayName = "NavBar";