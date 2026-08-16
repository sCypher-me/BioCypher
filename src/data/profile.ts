export type StackItem = {
  id: string
  label: string
  code: string
  category: string
  signal: "CORE" | "ADVANCED" | "EXPLORING"
  description: string
  tools: string[]
  orbitLabel: string
}

export type PortalTab = "social" | "about" | "stacks"

export type PortalDestination =
  | { id: string; kind: "tab"; tab: PortalTab; label: string }
  | { id: string; kind: "external"; href: string; label: string }

export type OracleCommand = {
  command: string
  aliases?: string[]
  description: string
  response?: string
  action?: "help" | "about" | "links" | "play" | "pause" | "share" | "sigil"
}

export type EasterEgg = {
  id: string
  sequence: string
  message: string
}

export type AboutTone = "default" | "cyan" | "azure" | "violet"

export type AboutSegment = {
  text: string
  tone?: AboutTone
}

export type AboutParagraph = {
  id: string
  segments: AboutSegment[]
}

export type AboutHighlight = {
  id: string
  label: string
}

export type AboutContent = {
  eyebrow: string
  quote: string
  paragraphs: AboutParagraph[]
  highlights: AboutHighlight[]
  closing: string
}

export type ResponsiveImage = {
  avifSrcSet: string
  webpSrcSet: string
  fallback: string
  width: number
  height: number
}

export type PlatformId =
  | "spotify"
  | "discord"
  | "instagram"
  | "x"
  | "gitlab"
  | "reddit"
  | "linkedin"
  | "steam"
  | "pinterest"
  | "threads"

export type PlatformEntry = {
  id: PlatformId
  label: string
  href: string | null
}

export type GithubRepositorySnapshot = {
  name: string
  description: string
  url: string
  language: string | null
  stars: number
  forks: number
  pushedAt: string
}

export type GithubSnapshot = {
  login: string
  name: string
  bio: string
  avatarUrl: string
  htmlUrl: string
  publicRepos: number
  followers: number
  following: number
  totalStars: number
  languages: string[]
  featuredRepository: GithubRepositorySnapshot | null
}

export const profile = {
  handle: "CYPHER",
  name: "JULIO CESAR",
  location: "Goiânia - GO",
  declaration: "> Quando o sinal encontra o sigilo.",
  bio: "Designer visual, desenvolvedor em formação e criador do Projeto Cypher.",
  currentSignal: "Construindo a V1.0 do CYPHER.dev.",

  ui: {
    tabTitle: "CYPHER",
    decrypted: "DECRYPTED",
    enter: "{ ENTER }",
    entryAriaLabel: "Entrar no perfil e iniciar a música",
    skipRitual: "PULAR RITUAL",
    skipRitualAriaLabel: "Pular o ritual e ir para a tela de entrada",
    entryGreek: "Όπου η κρυπτογραφία αγγίζει το θείο",
    entryTranslation: "Onde a criptografia toca o divino",
    signal: "SIGNAL",
    randomPortal: "Abrir portal aleatório",
    decodedArchive: "ARQUIVO DECODIFICADO",
    currentSignal: "SINAL ATUAL",
    opensNewTab: "abre em uma nova aba",
    motion: {
      enabled: "Pausar animações",
      paused: "Retomar animações",
      enabledStatus: "Animações ativas",
      pausedStatus: "Animações pausadas",
    },
    tabs: { social: "SOCIAIS", about: "SOBRE MIM", stacks: "STACKS" },
    share: {
      label: "COMPARTILHAR",
      title: "CYPHER.dev // JULIO CESAR",
      text: "Conheça Julio Cesar e o Projeto Cypher.",
      success: "Link copiado. Sinal pronto para compartilhar.",
      error: "Não foi possível compartilhar o link.",
    },
    player: {
      seek: "Posição da música",
      volume: "Volume",
      openVolume: "Abrir controle de volume",
      mute: "Silenciar música",
      unmute: "Ativar som",
      play: "Tocar música",
      pause: "Pausar música",
    },
    github: {
      expand: "Expandir dossiê GitHub",
      collapse: "Recolher dossiê GitHub",
      open: "ABRIR GITHUB",
      repositories: "REPOSITÓRIOS",
      followers: "SEGUIDORES",
      following: "SEGUINDO",
      stars: "ESTRELAS",
      languages: "LINGUAGENS",
      featured: "REPOSITÓRIO EM DESTAQUE",
      loading: "SINCRONIZANDO",
      sourceLive: "DADOS AO VIVO",
      sourceCached: "CACHE LOCAL",
      sourceMixed: "DADOS PARCIAIS",
      sourceFallback: "RESUMO LOCAL",
      noDescription: "Sem descrição pública.",
    },
    platforms: {
      locked: "CANAL BLOQUEADO",
    },
    support: {
      kicker: "Criptografado",
      label: "ME PAGUE UM CAFÉ",
    },
  },

  media: {
    logo: {
      avifSrcSet: "/logo-256.avif 256w, /logo-512.avif 512w",
      webpSrcSet: "/logo-256.webp 256w, /logo-512.webp 512w",
      fallback: "/logo-512.webp",
      width: 512,
      height: 512,
    } satisfies ResponsiveImage,
    photo: {
      avifSrcSet: "/photo-160.avif 160w, /photo-320.avif 320w",
      webpSrcSet: "/photo-160.webp 160w, /photo-320.webp 320w",
      fallback: "/photo-320.webp",
      width: 320,
      height: 320,
    } satisfies ResponsiveImage,
    cardWatermark: {
      avifSrcSet: "/logo-256.avif 256w",
      webpSrcSet: "/logo-256.webp 256w",
      fallback: "/logo-256.webp",
      width: 256,
      height: 256,
    } satisfies ResponsiveImage,
    openGraph: "/og-cypher.jpg",
  },
  loading: {
    title: "CYPHER",
    status: "> SINCRONIZANDO CIFRAS...",
    name: "JULIO CESAR",
    hudCode: "10110",
    durationMs: 3800,
    skipForSession: true,
  },
  audio: {
    src: "/audio/background-128.mp3",
    title: "IN THE END (SLOWED)",
    artist: "Tommee Profitt, Fleurie",
    entryVolume: 0.4,
    initialVolume: 0.6,
    statusLabels: {
      idle: "Inativo",
      loading: "Carregando",
      ready: "Pronto",
      playing: "Tocando",
      paused: "Pausado",
      error: "Não foi possível carregar a música.",
    },
  },

  github: {
    username: "sCypher-me",
    url: "https://github.com/sCypher-me",
    cacheKey: "cypher:github:v1:sCypher-me",
    snapshot: {
      login: "sCypher-me",
      name: "Julio Cesar",
      bio: "Designer visual, desenvolvedor em formação e criador do Projeto Cypher.",
      avatarUrl: "/photo-320.webp",
      htmlUrl: "https://github.com/sCypher-me",
      publicRepos: 1,
      followers: 0,
      following: 0,
      totalStars: 0,
      languages: ["TypeScript"],
      featuredRepository: {
        name: "CypherLink",
        description: "Cinematic dark-japanese link-in-bio built with React, Vite, Tailwind and Motion.",
        url: "https://github.com/sCypher-me/CypherLink",
        language: "TypeScript",
        stars: 0,
        forks: 0,
        pushedAt: "2026-08-15T14:38:54Z",
      },
    } satisfies GithubSnapshot,
  },

  platforms: [
    { id: "spotify", label: "Spotify", href: null },
    { id: "discord", label: "Discord", href: null },
    { id: "instagram", label: "Instagram", href: null },
    { id: "x", label: "X", href: null },
    { id: "gitlab", label: "GitLab", href: null },
    { id: "reddit", label: "Reddit", href: null },
    { id: "linkedin", label: "LinkedIn", href: null },
    { id: "steam", label: "Steam", href: null },
    { id: "pinterest", label: "Pinterest", href: null },
    { id: "threads", label: "Threads", href: null },
  ] satisfies PlatformEntry[],

  support: {
    href: "https://buymeacoffee.com/cypherdv",
  },

  portalDestinations: [
    { id: "about", kind: "tab", tab: "about", label: "Sobre mim" },
    { id: "stacks", kind: "tab", tab: "stacks", label: "Stacks" },
    { id: "github", kind: "external", href: "https://github.com/sCypher-me", label: "GitHub" },
  ] satisfies PortalDestination[],

  oracle: {
    title: "CYPHER ORACLE // digite help",
    channelLabel: "⌖ CANAL ORÁCULO",
    close: "Fechar oráculo",
    placeholder: "digite um comando_",
    inputLabel: "Comando do oráculo",
    execute: "EXECUTAR",
    unknown: "Comando não reconhecido. Digite help.",
    linksRevealed: "Canais sociais revelados.",
    commands: [
      { command: "help", aliases: ["ajuda"], description: "lista os comandos disponíveis", action: "help" },
      { command: "about", aliases: ["sobre"], description: "abre a apresentação", action: "about" },
      { command: "links", aliases: ["canais"], description: "revela os canais sociais", action: "links" },
      { command: "play", aliases: ["tocar"], description: "inicia a música", action: "play" },
      { command: "pause", aliases: ["pausar"], description: "pausa a música", action: "pause" },
      { command: "transmit", aliases: ["share", "compartilhar"], description: "compartilha este perfil", action: "share" },
      { command: "sigil", aliases: ["sigilo"], description: "ativa o selo oculto", action: "sigil" },
      { command: "whoami", aliases: ["quem-sou"], description: "identifica o observador", response: "Você também faz parte do sinal." },
    ] satisfies OracleCommand[],
  },
  easterEggs: [
    { id: "keyboard-sigil", sequence: "sigil", message: "A máquina sonha em geometria sagrada." },
  ] satisfies EasterEgg[],
  about: {
    eyebrow: "JULIO CESAR",
    quote: "Designer por essência. Desenvolvedor por evolução.",
    paragraphs: [
      {
        id: "origin",
        segments: [
          { text: "Sou o criador do " },
          { text: "Projeto Cypher", tone: "cyan" },
          { text: ". Há mais de " },
          { text: "4 anos", tone: "azure" },
          { text: " trabalho com Design Visual e UI, criando identidades e interfaces digitais." },
        ],
      },
      {
        id: "formation",
        segments: [
          { text: "Hoje curso " },
          { text: "Análise e Desenvolvimento de Sistemas", tone: "violet" },
          { text: " para levar essa mesma intenção visual ao código e à arquitetura dos produtos." },
        ],
      },
    ],
    highlights: [
      { id: "design", label: "Comunicação visual e identidade" },
      { id: "code", label: "Interfaces transformadas em código" },
      { id: "projects", label: "Projetos autorais do conceito à entrega" },
    ],
    closing: "Aprendo construindo. O Cypher é o ponto em que meu repertório visual encontra a programação.",
  } satisfies AboutContent,
  stacks: [
    {
      id: "s1",
      label: "React / TypeScript",
      code: "SYS.01",
      category: "FRONTEND",
      signal: "CORE",
      description: "Interfaces tipadas, responsivas e orientadas a componentes reutilizáveis.",
      tools: ["React", "TypeScript", "Vite"],
      orbitLabel: "REACT",
    },
    {
      id: "s2",
      label: "Node / APIs",
      code: "SYS.02",
      category: "BACKEND",
      signal: "ADVANCED",
      description: "Serviços, integrações e fluxos de dados para produtos conectados.",
      tools: ["Node.js", "REST", "APIs"],
      orbitLabel: "NODE",
    },
    {
      id: "s3",
      label: "UI Motion",
      code: "VIS.03",
      category: "MOTION",
      signal: "ADVANCED",
      description: "Microinterações e transições que explicam estados sem interromper a experiência.",
      tools: ["Motion", "CSS", "Canvas"],
      orbitLabel: "MOTION",
    },
    {
      id: "s4",
      label: "Audio / WebGL",
      code: "EXP.04",
      category: "EXPERIMENTAL",
      signal: "EXPLORING",
      description: "Experimentos audiovisuais, análise de frequência e superfícies generativas.",
      tools: ["Web Audio", "WebGL", "Canvas"],
      orbitLabel: "AUDIO",
    },
    {
      id: "s5",
      label: "Design / Branding",
      code: "VIS.05",
      category: "DESIGN",
      signal: "CORE",
      description: "Identidades, direção visual e sistemas de interface com linguagem própria.",
      tools: ["UI Design", "Branding", "Figma"],
      orbitLabel: "DESIGN",
    },
  ] satisfies StackItem[],
  footer: "@2026 Direitos Reservados CYPHER.DEV | Júlio César",
}

export type Profile = typeof profile
