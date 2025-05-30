"use client";

import * as React from "react";

import { CheckCircle, Clock, Diamond, DiamondIcon, MoveDownLeft, MoveUpRight } from "lucide-react"; // Importar ícones necessários
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Importar componentes Card
import { cn } from "@/lib/utils"; // Importar cn

// Interface para os dados de estatísticas que virão do componente pai
interface DashboardStats {
  consultas_concluidas: number;
  consultas_pendentes: number;
  gemas_usadas: number;
  gemas_restantes: number;
}

// O componente principal 'Stats'
interface StatsProps {
  stats: DashboardStats;
}

export function Stats({ stats }: StatsProps) {
  // Use toLocaleString('pt-BR') para garantir formatação consistente
  const data = [
    {
      name: "Consultas Concluídas",
      value: stats.consultas_concluidas.toLocaleString('pt-BR'),
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
    {
      name: "Consultas Pendentes",
      value: stats.consultas_pendentes.toLocaleString('pt-BR'),
      icon: <Clock className="h-6 w-6 text-orange-600" />,
    },
    {
      name: "Tokens Usados",
      value: stats.gemas_usadas.toLocaleString('pt-BR'),
      icon: <Diamond className="h-6 w-6 text-blue-600" />,
    },
    {
      name: "Tokens Restante",
      value: stats.gemas_restantes.toLocaleString('pt-BR'),
      icon: <DiamondIcon className="h-6 w-6 text-yellow-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((item) => (
        // Utilizar componentes Card importados
        <Card key={item.name} className="flex flex-col justify-between p-6">
          <CardHeader className="p-0 pb-4">
             <CardDescription className="text-gray-500 mb-1">{item.name}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
                <CardTitle className="text-4xl font-bold">{item.value}</CardTitle>
                <div className="bg-muted p-2 rounded-full flex-shrink-0">
                  {item.icon}
                </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 