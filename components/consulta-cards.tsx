import { Eye, Heart, MessageCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConsultaCardsProps {
  stats: {
    visualizacoes: number
    curtidas: number
    comentarios: number
    duracao_media: string
  }
  videoCount: number
}

export function ConsultaCards({ stats, videoCount }: ConsultaCardsProps) {
  const data = [
    {
      name: "Total de Visualizações",
      value: stats.visualizacoes.toLocaleString(),
      icon: <Eye className="w-5 h-5 text-gray-600" />,
    },
    {
      name: "Total de Curtidas",
      value: stats.curtidas.toLocaleString(),
      icon: <Heart className="w-5 h-5 text-red-600" />,
    },
    {
      name: "Total de Comentários",
      value: stats.comentarios.toLocaleString(),
      icon: <MessageCircle className="w-5 h-5 text-green-600" />,
    },
    {
      name: "Média de Duração",
      value: stats.duracao_media,
      icon: <Clock className="w-5 h-5 text-blue-600" />,
    },
  ];

  return (
    <div className="flex items-center justify-center p-10 w-full">
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {data.map((item) => (
          <Card key={item.name} className="p-0 gap-0 flex flex-col justify-between border rounded-md shadow">
            <CardContent className="p-6">
              <dd className="flex items-start justify-between space-x-2">
                <span className="truncate text-sm text-muted-foreground">
                  {item.name}
                </span>
                {item.icon && (
                  <div className="flex-shrink-0 bg-muted rounded-full p-2">
                    {item.icon}
                  </div>
                )}
              </dd>
              <dd className="mt-1 text-3xl font-semibold text-foreground">
                {item.value}
              </dd>
            </CardContent>
          </Card>
        ))}
      </dl>
    </div>
  )
}
