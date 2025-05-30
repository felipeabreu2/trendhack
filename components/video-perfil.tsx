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
    <div className="bg-card rounded-lg p-6 shadow border">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Perfil</h2>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <img
            src={perfil.avatar || "/placeholder.svg?height=64&width=64"}
            alt={perfil.nome}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div>
          <h3 className="font-semibold text-foreground">{perfil.nome}</h3>
          <p className="text-muted-foreground">{perfil.usuario}</p>
        </div>

        <div className="ml-auto grid grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Plataforma</p>
            <p className="text-foreground">{perfil.plataforma}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Seguidores</p>
            <p className="text-foreground">{formatNumber(perfil.seguidores)}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Seguindo</p>
            <p className="text-foreground">{formatNumber(perfil.seguindo)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
