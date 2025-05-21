import { AlertCircle, Diamond } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Platform {
  id: string;
  name: string;
  image: string;
  slug: string;
}

// Definir a interface para os dados do resumo que virão do componente pai
interface SummaryData {
  platformName: string;
  extractionTypeName: string;
  estimatedTime: string;
  costPerResult: number;
  totalCost: number;
}

interface NovaConsultaResumoProps {
  // Remover costDetails, pois agora recebemos summaryData com o custo total correto
  // costDetails: { costPerResult: number, totalProfiles: number, expectedResults: number };
  // Aceitar a nova prop summaryData
  summaryData: SummaryData;
  // Manter props antigas por enquanto, caso ainda sejam usadas diretamente na UI
  selectedPlatform?: Platform; // Plataforma selecionada (opcional)
  selectedExtractionType?: string; // Tipo de extração selecionado (opcional)
}

// Atualizar as props recebidas no componente para incluir summaryData e remover costDetails
export function NovaConsultaResumo({ summaryData, selectedPlatform, selectedExtractionType }: NovaConsultaResumoProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Resumo</h2>

      <div className="space-y-4">
        <div>
          <p className="text-gray-500 mb-1">Detalhes da sua consulta</p>

          <div className="space-y-2">
            {/* Usar summaryData para exibir o nome da plataforma */}
            {summaryData.platformName && (
              <div className="flex items-center gap-2">
                <p className="text-gray-500">Plataforma</p>
                <div className="flex items-center ml-auto">
                  {/* Se o image da plataforma for necessário, talvez precise manter selectedPlatform ou passar a imagem em summaryData */}
                  {selectedPlatform?.image && (
                    <img src={selectedPlatform.image} alt={summaryData.platformName} className="h-4 w-4 mr-1" />
                  )}
                  <span>{summaryData.platformName}</span>
                </div>
              </div>
            )}

            {/* Usar summaryData para exibir o tipo de extração */}
            {summaryData.extractionTypeName && (
              <div className="flex items-center gap-2">
                <p className="text-gray-500">Tipo de Extração</p>
                <div className="flex items-center ml-auto">
                  <span>{summaryData.extractionTypeName}</span>
                </div>
              </div>
            )}

            {/* Usar summaryData para exibir o tempo estimado */}
            {summaryData.estimatedTime && (
            <div className="flex items-center gap-2">
              <p className="text-gray-500">Tempo estimado</p>
                <span className="ml-auto">{summaryData.estimatedTime}</span>
            </div>
            )}

            {/* Usar summaryData para exibir o custo por resultado */}
            <div className="flex items-center gap-2">
              <p className="text-gray-500">Custo por resultado</p>
              <div className="flex items-center ml-auto">
                <Diamond className="h-3 w-3 mr-1 text-purple-600" />
                <span>{summaryData.costPerResult} tokens</span>
              </div>
            </div>

            {/* Usar summaryData para exibir o custo total calculado */}
            <div className="flex items-center gap-2">
              <p className="text-gray-500">Custo total</p>
              <div className="flex items-center ml-auto">
                <Diamond className="h-3 w-3 mr-1 text-purple-600" />
                <span>{summaryData.totalCost} tokens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manter o alerta de tokens, ajustando o texto se necessário */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Atenção</AlertTitle>
          <AlertDescription className="text-amber-700">
            Você tem 105 tokens disponíveis. Esta consulta utilizará {summaryData.totalCost} tokens.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
