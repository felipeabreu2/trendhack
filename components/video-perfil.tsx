interface VideoPerfilProps {
  perfil: {
    nome: string
    usuario: string
    plataforma: string
    seguidores: number
    seguindo: number
    avatar: string
  }
}

export function VideoPerfil({ perfil }: VideoPerfilProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Perfil</h2>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
          <img
            src={perfil.avatar || "/placeholder.svg?height=64&width=64"}
            alt={perfil.nome}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div>
          <h3 className="font-semibold">{perfil.nome}</h3>
          <p className="text-gray-500">{perfil.usuario}</p>
        </div>

        <div className="ml-auto grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Plataforma</p>
            <p>{perfil.plataforma}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Seguidores</p>
            <p>{formatNumber(perfil.seguidores)}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Seguindo</p>
            <p>{formatNumber(perfil.seguindo)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
