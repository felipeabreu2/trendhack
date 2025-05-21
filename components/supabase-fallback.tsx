"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function SupabaseFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Configuração do Supabase Necessária</CardTitle>
          <CardDescription>As variáveis de ambiente do Supabase não foram configuradas corretamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro de Configuração</AlertTitle>
            <AlertDescription>
              Para usar o Trend Hack, você precisa configurar as variáveis de ambiente do Supabase.
            </AlertDescription>
          </Alert>

          <div className="mt-4 space-y-4 text-sm">
            <p>
              Adicione as seguintes variáveis ao seu arquivo <code>.env.local</code>:
            </p>
            <pre className="rounded bg-gray-100 p-2 text-xs">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
              <br />
              SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
            </pre>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
