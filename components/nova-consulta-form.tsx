  "use client"

  import { useState, useEffect, useMemo, useCallback } from "react"
  import { useRouter } from "next/navigation"
  import { zodResolver } from "@hookform/resolvers/zod"
  import { useForm } from "react-hook-form"
  import * as z from "zod"
  import { createBrowserClient } from "@/lib/supabase-browser"
  import { Button } from "@/components/ui/button"
  import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
  import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { useToast } from "@/components/ui/use-toast"
  import { Instagram, Loader2, Search, X } from "lucide-react"

  interface Platform {
    id: string;
    name: string;
    image: string;
    slug: string;
  }

  interface PlataformTool {
    id: string;
    name: string;
    plataform: string;
    description: string;
    type?: 'page' | 'url';
    gemas: number;
  }

  // Definindo a interface para um perfil no estado do formulário
  interface ProfileState {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
    seguidores?: number;
    seguindo?: number;
    platform_slug?: string; // Adicionar slug da plataforma para fácil acesso
    full_name?: string;
    profile_pic_url?: string;
    followers_count?: number;
    "followsCount"?: number;
    platform?: string;
  }

  interface NovaConsultaFormProps {
    platforms: Platform[];
    plataformTools: PlataformTool[];
    onPlatformSelect: (platform: Platform | undefined) => void;
    onExtractionTypeSelect: (type: string | undefined) => void;
    selectedProfiles: ProfileState[];
    setSelectedProfiles: React.Dispatch<React.SetStateAction<ProfileState[]>>;
    expectedResults: string;
    setExpectedResults: React.Dispatch<React.SetStateAction<string>>;
    onSummaryUpdate: (summaryData: {
      platformName: string;
      extractionTypeName: string;
      estimatedTime: string; // Assumindo que vem da ferramenta, ou pode ser fixo
      costPerResult: number;
      totalCost: number;
      availableTokens: number;
    }) => void;
    onIniciarConsulta: (periodo: string, periodoUnit: string, resultadosEsperados: string, urlValue: string) => Promise<void>;
  }

  // Definindo o schema base - removendo perfil e url daqui
  const baseFormSchema = z.object({
    plataforma: z.string().nonempty("Selecione uma plataforma."),
    tipo_extracao: z.string().nonempty("Selecione um tipo de extração."),
    periodo: z.string().nonempty("Informe o período de busca."),
    periodoUnit: z.string().nonempty("Selecione a unidade de tempo."),
    resultados: z.string().min(1, {
      message: "Informe a quantidade de resultados esperados.",
    }).nonempty("Informe a quantidade de resultados esperados."),
  });

  // Definindo o schema para a lista de perfis/urls
  const profilesOrUrlsSchema = z.object({
    profiles: z.array(z.object({
      id: z.string(), // Opcional se o perfil ainda não foi salvo no banco
      username: z.string(),
      platform_slug: z.string(),
      // Incluir validações para outras propriedades se necessário
    })).optional(), // Tornar a lista opcional inicialmente
    urls: z.array(z.string().url("URL inválida.")).optional(), // Tornar a lista opcional inicialmente
  });

  // Definir interface para o payload do evento UPDATE do Supabase Realtime na tabela 'pages'
  interface PagesUpdatePayload {
    commit_timestamp: string;
    eventType: 'UPDATE';
    new: ProfileState; // Os novos dados do registro atualizado devem corresponder à estrutura ProfileState
    old: { id: string }; // Dados antigos, geralmente apenas o ID em UPDATES
    schema: 'public';
    table: 'pages';
  }

  export function NovaConsultaForm({
    platforms,
    plataformTools,
    onPlatformSelect,
    onExtractionTypeSelect,
    selectedProfiles,
    setSelectedProfiles,
    expectedResults,
    setExpectedResults,
    onSummaryUpdate,
    onIniciarConsulta,
  }: NovaConsultaFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [perfilInput, setPerfilInput] = useState("")
    const [urlInput, setUrlInput] = useState("")

    const router = useRouter()
    const { toast } = useToast()
    const supabase = createBrowserClient()

    // Combinando schemas para o useForm inicial (para que form.watch funcione)
    const initialFormSchema = baseFormSchema.merge(z.object({ perfil: z.string().optional(), url: z.string().optional() }));

    const form = useForm<z.infer<typeof initialFormSchema>>({
      resolver: zodResolver(initialFormSchema),
      defaultValues: {
        plataforma: "",
        tipo_extracao: "",
        perfil: "", // Manter para o input controlado
        periodo: "30",
        periodoUnit: "days",
        resultados: "1", // Usar prop e converter para string para o input
        url: "", // Manter para o input controlado
      },
    })

    const selectedPlatformName = form.watch("plataforma")
    const selectedExtractionType = form.watch("tipo_extracao")

    const filteredPlataformTools: PlataformTool[] = useMemo(() => {
      const tools = selectedPlatformName
        ? plataformTools.filter(
          (tool) => {
            const platform = platforms.find(p => p.name === selectedPlatformName);
            return platform && tool.plataform === platform.id;
          }
        )
        : [];

      // Remover duplicatas baseadas no nome antes de renderizar
      const seenNames = new Set();
      return tools.filter(tool => {
        const isDuplicate = seenNames.has(tool.name);
        seenNames.add(tool.name);
        return !isDuplicate;
      });

    }, [selectedPlatformName, plataformTools, platforms]);

    useEffect(() => {
      //console.log("selectedPlatformName changed:", selectedPlatformName);
      const platform = platforms.find(p => p.name === selectedPlatformName);
      onPlatformSelect(platform);
      form.setValue("tipo_extracao", "");
      setPerfilInput("");
      setUrlInput("");
      form.setValue("perfil", "");
      form.setValue("url", "");
    }, [selectedPlatformName, form.setValue, onPlatformSelect, platforms]);

    useEffect(() => {
      // Limpar inputs e listas dependentes ao mudar o tipo de extração
      setPerfilInput("");
      setUrlInput("");
      // Remover valores antigos do form state
      form.setValue("perfil", "");
      form.setValue("url", "");
      // Limpar lista de perfis selecionados e resetar resultados esperados ao mudar o tipo de extração
      setSelectedProfiles([]);
      form.setValue("resultados", "1"); // Resetar para o valor padrão
    }, [selectedExtractionType, form.setValue, setSelectedProfiles]);

    const selectedTool = useMemo(() => {
      const foundTool = filteredPlataformTools.find(tool => tool.name === selectedExtractionType);
      return foundTool;
    }, [selectedExtractionType, filteredPlataformTools, platforms]);

    const displayValue = useMemo(() => {
      return selectedTool ? selectedTool.name : "Selecione o tipo de extração";
    }, [selectedTool]);

    // Observar campos resultados e url fora do useEffect para usar nas dependências
    const watchedResultados = form.watch("resultados");
    const watchedUrl = form.watch("url");

    // Efeito para configurar a subscrição Supabase Realtime para atualizações de perfis
    useEffect(() => {
      const channel = supabase
        .channel('realtime profiles') // Nome do canal, pode ser qualquer string
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'pages',
        }, (payload: PagesUpdatePayload) => { // Tipar o payload aqui
          console.log('Change received!', payload);
          // Atualizar a lista de perfis selecionados se o perfil modificado estiver nela
          setSelectedProfiles(prevProfiles =>
            prevProfiles.map(profile => {
              if (profile.id === payload.new.id) {
                // Mesclar os dados antigos com os novos dados do payload
                // É importante garantir que a estrutura dos dados do payload.new
                // seja compatível ou mapeada para a interface ProfileState
                return {
                  ...profile,
                  ...payload.new,
                  // Sobrescrever ou mapear campos específicos se necessário
                  name: payload.new.full_name || payload.new.username, // Exemplo de mapeamento
                  avatar: payload.new.profile_pic_url, // Exemplo de mapeamento
                  seguidores: payload.new.followers_count || 0, // Exemplo de mapeamento
                  seguindo: payload.new["followsCount"] || 0, // Exemplo de mapeamento
                  platform_slug: payload.new.platform, // Exemplo de mapeamento
                };
              } else {
                return profile;
              }
            })
          );
        })
        .subscribe();

      // Função de limpeza para remover a subscrição ao desmontar o componente
      return () => {
        supabase.removeChannel(channel);
      };
      // Incluir supabase e setSelectedProfiles nas dependências
    }, [supabase, setSelectedProfiles]); // Adicionar dependências

    useEffect(() => {
      // Calcular e atualizar o resumo no componente pai
      const platformName = selectedPlatformName;
      const extractionTypeName = selectedExtractionType;
      const estimatedTime = "1-10 minutos";
      const costPerResult = filteredPlataformTools.find(tool => tool.name === selectedExtractionType)?.gemas || 0;
      const numberOfProfiles = selectedProfiles.length;
      // Usar o valor observado diretamente do formulário
      const expectedResultsCount = parseInt(watchedResultados || "0", 10);

      // Usar o valor observado do campo URL
      const urlValue = watchedUrl;
      // Remover numberOfUrls, não usamos uma lista
      // const numberOfUrls = selectedUrls.length;

      let totalCost = 0;

      // Calcular o custo total com base no tipo de extração
      if (selectedTool?.type === 'page') {
        totalCost = numberOfProfiles * expectedResultsCount * costPerResult;
      } else if (selectedTool?.type === 'url') {
        // Calcular custo total com base na presença da URL e custo por resultado (gemas da ferramenta)
        // Custo é costPerResult se URL preenchida, 0 se vazia.
        totalCost = urlValue ? costPerResult : 0;
      }

      //console.log("Atualizando resumo:", { // Adicionado para depuração
      //  platformName,
      //  extractionTypeName,
      //  estimatedTime,
      //  costPerResult,
      //  numberOfProfiles,
      //  expectedResultsCount,
      //  totalCost,
      //});

      onSummaryUpdate({
        platformName,
        extractionTypeName,
        estimatedTime,
        costPerResult,
        totalCost,
        availableTokens: 0, // Assuming availableTokens is always 0 for the given implementation
      });

    }, [selectedProfiles, watchedResultados, watchedUrl, filteredPlataformTools, selectedPlatformName, selectedExtractionType, onSummaryUpdate, form]); // Adicionar form nas dependências pode ajudar com a estabilidade se watch/getValues forem o problema

    const buscarPerfil = async () => { // Não precisa mais receber usuario como argumento
      const usuario = perfilInput; // Usar o valor do estado local do input
      if (!usuario) return;

      setIsSearching(true);

      const formattedUsername = usuario.startsWith('@') ? usuario.substring(1) : usuario; // Remover o @
      const selectedPlatformObj = platforms.find(p => p.name === form.getValues("plataforma"));

      if (!selectedPlatformObj) {
        console.error("Plataforma selecionada não encontrada.");
        setIsSearching(false);
        return;
      }

      // Verificar se o perfil já foi adicionado à lista
      if (selectedProfiles.some(profile => profile.username === formattedUsername && profile.platform_slug === selectedPlatformObj.slug)) {
        toast({
          title: "Perfil já adicionado",
          description: `O perfil @${formattedUsername} já está na lista.`,
        });
        setIsSearching(false);
        return;
      }

      // ... (lógica existente para buscar e criar perfil no Supabase)
      // Substituir a parte de setPerfilEncontrado por adicionar à lista selectedProfiles

      // Simulação temporária - substituir pela lógica real do Supabase
      setTimeout(async () => {
        // Lógica real para buscar/criar perfil aqui
        let existingProfile = null;
        let fetchError = null;

        try {
          const response: { data: ProfileState | null; error: any } = await supabase
            .from('pages')
            .select('id, username, full_name, profile_pic_url, followers_count, "followsCount", platform')
            .eq('username', formattedUsername)
            .single();

          existingProfile = response.data;
          fetchError = response.error;

        } catch (error: any) { // Anotar tipo do erro
          console.error('Supabase fetch error:', error);
          fetchError = error;
        }

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 é erro de 'não encontrado'
          console.error('Error fetching profile:', fetchError);
          setIsSearching(false);
          toast({
            title: "Erro ao buscar perfil",
            description: "Ocorreu um erro ao buscar o perfil. Tente novamente.",
            variant: "destructive",
          });
          return;
        }

        let profileToAdd: ProfileState;

        if (existingProfile) {
          profileToAdd = {
            id: existingProfile.id,
            username: existingProfile.username,
            name: existingProfile.full_name || existingProfile.username,
            avatar: existingProfile.profile_pic_url,
            seguidores: existingProfile.followers_count || 0,
            seguindo: existingProfile["followsCount"] || 0,
            platform_slug: existingProfile.platform,
            full_name: existingProfile.full_name,
            profile_pic_url: existingProfile.profile_pic_url,
            followers_count: existingProfile.followers_count,
            "followsCount": existingProfile["followsCount"],
            platform: existingProfile.platform,
          };
          toast({
            title: "Perfil encontrado",
            description: `Perfil @${existingProfile.username} encontrado e adicionado.`,
          });

        } else {
          const newProfileData = {
            username: formattedUsername,
            plataform_id: selectedPlatformObj.id,
            platform: selectedPlatformObj.slug,
          };

          const { data: newProfile, error: createError } = await supabase
            .from('pages')
            .insert([newProfileData])
            .select('id, username, full_name, profile_pic_url, followers_count, "followsCount", platform')
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            setIsSearching(false);
            toast({
              title: "Erro ao criar perfil",
              description: "Ocorreu um erro ao criar o novo perfil. Tente novamente.",
              variant: "destructive",
            });
            return;
          }

          profileToAdd = {
            id: newProfile.id,
            username: newProfile.username,
            name: newProfile.full_name || newProfile.username,
            avatar: newProfile.profile_pic_url,
            seguidores: newProfile.followers_count || 0,
            seguindo: newProfile["followsCount"] || 0,
            platform_slug: newProfile.platform,
            full_name: newProfile.full_name,
            profile_pic_url: newProfile.profile_pic_url,
            followers_count: newProfile.followers_count,
            "followsCount": newProfile["followsCount"],
            platform: newProfile.platform,
          };
          toast({
            title: "Perfil criado",
            description: `Novo perfil @${newProfile.username} criado e adicionado.`,
          }
          );
        }

        // Adicionar o perfil à lista usando a função passada via prop
        setSelectedProfiles(prevProfiles => [...prevProfiles, profileToAdd]);
        setPerfilInput("");

        setIsSearching(false);

      }, 500); // Mantendo um pequeno delay para simular a busca
    };

    const limparPerfil = (usernameToRemove: string) => {
      setSelectedProfiles(prevProfiles => prevProfiles.filter(profile => profile.username !== usernameToRemove));
    };

    async function onSubmit(values: z.infer<typeof baseFormSchema>) {
      setIsLoading(true);

      // Mover a busca pela ferramenta e plataforma e obtenção da URL para o início da função
      const selectedTool = filteredPlataformTools.find(tool => tool.name === values.tipo_extracao);
      const selectedPlatformObj = platforms.find(p => p.name === values.plataforma);
      const urlValue = form.getValues("url"); // Obter url diretamente do formulário

      // Validação condicional para listas
      if (selectedTool?.type === 'page' && selectedProfiles.length === 0) {
        toast({
          title: "Perfis necessários",
          description: "Por favor, adicione pelo pelo menos um perfil para esta consulta.",
          variant: "destructive",
        });
        setIsLoading(false); // Parar loading na falha de validação
        return;
      }
      // Validar campo URL para tipo 'url'
      if (selectedTool?.type === 'url') {
        // Verificar se a URL está vazia ou undefined
        if (!urlValue) {
           toast({
            title: "URL necessária",
            description: "Por favor, insira uma URL para esta consulta.",
            variant: "destructive",
          });
          setIsLoading(false); // Parar loading na falha de validação
          return;
        }

        // Se a URL não estiver vazia, tentar validar o formato
        try {
          new URL(urlValue);
        } catch (e) {
          toast({
            title: "URL inválida",
            description: "Por favor, insira uma URL válida.",
            variant: "destructive",
          });
          setIsLoading(false); // Parar loading na falha de validação
          return;
        }
      }

      // A lógica de salvar no banco está na função onIniciarConsulta passada como prop
      // Chamá-la com os valores corretos
      await onIniciarConsulta(
        values.periodo,
        values.periodoUnit,
        values.resultados,
        urlValue || ''
      );

      // A lógica de loading e redirecionamento está dentro de onIniciarConsulta
      // Não precisamos parar o loading aqui novamente, a menos que onIniciarConsulta lance um erro.
      // Se onIniciarConsulta lançar um erro, o cath block no componente pai (ClientPageContent) lidará com isso.
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Plataforma</h3>
            <FormField
              control={form.control}
              name="plataforma"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      {platforms.map((platform) => (
                        <div
                          key={platform.name}
                          className={`flex items-center space-x-2 rounded-full px-4 py-2 border cursor-pointer ${field.value === platform.name ? "bg-primary/10 border-primary" : "bg-card border-border"}`}
                        >
                          <RadioGroupItem value={platform.name} id={platform.name} className="sr-only" />
                          {platform.image && (
                            <img src={platform.image} alt={platform.name} className="h-4 w-4" />
                          )}
                          <label
                            htmlFor={platform.name}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {platform.name}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Tipo de extração</h3>
            <FormField
              control={form.control}
              name="tipo_extracao"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      // Atualiza o valor no formulário
                      field.onChange(value);

                      // Força uma atualização do campo para garantir que o UI reflita a mudança
                      setTimeout(() => {
                        form.setValue("tipo_extracao", value, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true
                        });
                      }, 0);

                      // Chama o callback externo
                      onExtractionTypeSelect(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-auto py-2 items-start">
                        <SelectValue placeholder="Selecione o tipo de extração" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper">
                      {filteredPlataformTools.map((tool) => (
                        <SelectItem key={tool.id} value={tool.name}>
                          <div className="flex flex-col flex-wrap w-full overflow-hidden text-left">
                            <span className="font-bold break-words">{tool.name}</span>
                            {tool.description && (
                              <span className="text-sm text-gray-500 break-words max-w-full">{tool.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          {selectedTool?.type === 'page' && (
            <div>
              <h3 className="text-lg font-medium mb-2">Perfis</h3>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="@username do perfil"
                  value={perfilInput}
                  onChange={(e) => setPerfilInput(e.target.value)}
                  className="pr-10 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevenir submit do form
                      buscarPerfil(); // Chamar buscarPerfil ao pressionar Enter
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={buscarPerfil}
                  disabled={isSearching || !perfilInput}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar
                </Button>
              </div>

              {selectedProfiles.length > 0 && (
                <div className="space-y-4">
                  {selectedProfiles.map(profile => (
                    <div key={profile.username} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            <img
                              src={profile.avatar || "/placeholder.svg"}
                              alt={profile.name || "Perfil"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{profile.name}</p>
                            <p className="text-sm text-gray-500">@{profile.username}</p>
                          </div>
                        </div>

                        <div className="text-right flex flex-row gap-4">
                          <div className="flex flex-col items-center">
                            <p className="font-medium">{profile.seguidores?.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Seguidores</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="font-medium">{profile.seguindo?.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Seguindo</p>
                          </div>
                        </div>

                        <Button type="button" variant="ghost" size="sm" onClick={() => limparPerfil(profile.username)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTool?.type === 'url' && (
            <div>
              <h3 className="text-lg font-medium mb-2">URL do Conteúdo</h3>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Insira a URL do vídeo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Condição para exibir Período de busca e Resultados esperados */}
          {selectedTool?.type === 'page' && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2">Período de busca</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="periodo"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="periodoUnit"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Unidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="days">Dias</SelectItem>
                              <SelectItem value="weeks">Semanas</SelectItem>
                              <SelectItem value="months">Meses</SelectItem>
                              <SelectItem value="years">Anos</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Período que a IA irá buscar os conteúdos da perfil na plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Resultados esperados</h3>
                <FormField
                  control={form.control}
                  name="resultados"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-gray-500 mt-2">Quantidade de resultados esperados que a IA irá trazer.</p>
              </div>
            </>
          )}

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando Consulta...
                </>
              ) : (
                "Iniciar Consulta"
              )}
            </Button>
          </div>
        </form>
      </Form>
    )
  }
