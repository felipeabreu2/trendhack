import { CheckCircle, Clock, Diamond, DiamondIcon } from "lucide-react"

interface DashboardCardsProps {
  stats: {
    consultas_concluidas: number
    consultas_pendentes: number
    gemas_usadas: number
    gemas_restantes: number
  }
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Consultas Concluídas</p>
            <h2 className="text-4xl font-bold">{stats.consultas_concluidas}</h2>
          </div>
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Consultas Pendentes</p>
            <h2 className="text-4xl font-bold">{stats.consultas_pendentes}</h2>
          </div>
          <div className="bg-orange-100 p-2 rounded-full">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Tokens Usados</p>
            <h2 className="text-4xl font-bold">{stats.gemas_usadas}</h2>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <Diamond className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-500 mb-1">Tokens Restante</p>
            <h2 className="text-4xl font-bold">{stats.gemas_restantes}</h2>
          </div>
          <div className="bg-yellow-100 p-2 rounded-full">
            <DiamondIcon className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
