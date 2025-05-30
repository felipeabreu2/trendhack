"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface VideoUrlProps {
  url: string
}

export function VideoUrl({ url }: VideoUrlProps) {
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL copiada",
      description: "URL do conteúdo copiada para a área de transferência",
    })
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">URL do Conteúdo</h2>

      <div className="flex">
        <Input value={url} readOnly className="rounded-r-none text-foreground" />
        <Button variant="outline" className="rounded-l-none border-l-0 text-foreground border-border hover:bg-muted hover:text-foreground" onClick={handleCopy}>
          <Copy className="h-4 w-4" />
          <span className="ml-2">Copiar</span>
        </Button>
      </div>
    </div>
  )
}
