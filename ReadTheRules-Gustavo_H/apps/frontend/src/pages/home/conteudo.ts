import dnd from "@/assets/sistemas/dnd.png";
import pathfinder from "@/assets/sistemas/pathfinder.png";
import ordem from "@/assets/sistemas/ordem-paranormal.png";
import oldDragon from "@/assets/sistemas/old-dragon.png";

export const SOBRE = [
  "O Read the Rules é uma plataforma feita para mestres de RPG de mesa. Ela reúne os sistemas de jogo que você usa em um só lugar e usa Inteligência Artificial para te ajudar a organizar, consultar e criar conteúdo para suas campanhas.",
  "Basta subir os arquivos de regras do seu sistema, e a plataforma te deixa perguntar qualquer coisa em linguagem natural, como “qual o efeito dessa condição?”, e recebe a resposta na hora, direto do seu material, com a fonte indicada. Além disso, a IA te ajuda a criar ideias de personagens, conflitos e locais para a sua campanha.",
  "Menos tempo procurando regra, mais tempo jogando.",
];

export type Ferramenta = { nome: string; texto: string[] };
export type Fase = { id: string; nome: string; intro: string; ferramentas: Ferramenta[] };

export const FASES: Fase[] = [
  {
    id: "pre",
    nome: "Pré-Sessão",
    intro: "Antes de sentar à mesa, o Read the Rules te ajuda a chegar preparado. Planeje suas sessões, organize suas campanhas e tenha tudo (personagens, locais, enredos) num só lugar, pronto para quando o jogo começar. Menos tempo montando anotação solta, mais tempo pensando na história que você quer contar.",
    ferramentas: [
      {
        nome: "Worldbuilding",
        texto: [
          "Todo grande RPG começa com um mundo bem construído, e é aí que o Read the Rules entra. A plataforma oferece um espaço dedicado para você dar forma ao seu universo antes mesmo da primeira sessão começar.",
          "Crie e organize locais, desde cidades inteiras até a taverna onde os personagens vão se encontrar pela primeira vez. Dê vida a NPCs com suas próprias motivações, histórias e segredos. Registre criaturas, deuses, itens, alianças e os conceitos que movem a política e as tensões da sua campanha.",
          "Tudo fica conectado dentro da sua campanha, então quando chegar a hora de jogar você não precisa procurar em cadernos ou documentos espalhados. Seu mundo, sua história. O Read the Rules só garante que nenhuma ideia boa se perca pelo caminho.",
        ],
      },
      {
        nome: "Escrever Sessão",
        texto: [
          "Planeje cada sessão com antecedência: o que deve acontecer, quais cenas podem surgir, que NPCs aparecem e que ganchos deixar para os jogadores.",
          "Cada sessão fica registrada dentro da campanha, em ordem, para você saber exatamente de onde a história continua.",
        ],
      },
      {
        nome: "Livros de Regras",
        texto: [
          "Envie os PDFs do seu sistema e dos seus suplementos. O Read the Rules lê o material e o deixa pronto para busca e para o assistente de IA.",
          "Seus arquivos ficam só na sua campanha e servem de base para todas as respostas.",
        ],
      },
    ],
  },
  {
    id: "intra",
    nome: "Intra-Sessão",
    intro: "Na hora do jogo, ninguém quer parar a cena para folhear trezentas páginas. Durante a sessão, o Read the Rules responde na hora e mantém o seu mundo a um clique de distância.",
    ferramentas: [
      {
        nome: "Busca Rápida",
        texto: [
          "Digite uma palavra e encontre a regra, o NPC ou o local em segundos.",
          "A busca entende o sentido, não só as palavras: “como agarrar alguém” encontra a regra de Atletismo contra Acrobacia mesmo sem essas palavras na pergunta.",
        ],
      },
      {
        nome: "Assistente de IA",
        texto: [
          "Pergunte em português, como perguntaria a outro mestre: “quanto de dano causa uma queda de 6 metros?”.",
          "A resposta vem do seu próprio material, com a fonte indicada, para você conferir e seguir com o jogo sem discussão na mesa.",
        ],
      },
      {
        nome: "Itens e Posses",
        texto: [
          "Saiba quem está carregando cada item: a espada amaldiçoada, a chave da cripta, o mapa rasgado.",
          "Quando um jogador pergunta “ainda estou com aquilo?”, a resposta está ali.",
        ],
      },
    ],
  },
  {
    id: "pos",
    nome: "Pós-Sessão",
    intro: "Quando os dados param de rolar, a história continua. Registre o que aconteceu enquanto ainda está fresco e prepare o terreno para o próximo encontro.",
    ferramentas: [
      {
        nome: "Notas da Campanha",
        texto: [
          "Anote decisões dos jogadores, pistas descobertas, promessas feitas e inimigos que fugiram.",
          "As notas ficam ligadas à campanha e entram na busca e nas respostas da IA.",
        ],
      },
      {
        nome: "Histórico de Perguntas",
        texto: [
          "Todas as perguntas feitas ao assistente ficam guardadas. Reveja as regras que surgiram na sessão e decida como lidar com elas da próxima vez.",
        ],
      },
      {
        nome: "Calendário do Grupo",
        texto: [
          "Proponha a data da próxima sessão e veja quem confirmou presença, sem perder a mensagem no meio do grupo.",
        ],
      },
    ],
  },
];

export const TTRPG = [
  "TTRPG (Tabletop Role-Playing Game) é o RPG de mesa: um jogo em que um grupo de pessoas cria uma história junto, conversando. Cada jogador interpreta um personagem e decide o que ele faz; o mestre descreve o mundo e as consequências. Os dados entram quando o resultado de uma ação é incerto.",
  "Não existe tabuleiro obrigatório nem um jeito único de vencer. O objetivo é viver a aventura, e cada mesa cria a sua.",
];

export const GLOSSARIO: { termo: string; def: string }[] = [
  { termo: "Mestre", def: "Também chamado de narrador ou DM. Descreve o mundo, interpreta os NPCs, aplica as regras e conduz a história." },
  { termo: "Player", def: "Cada jogador da mesa. Controla um personagem e decide o que ele fala e faz." },
  { termo: "Sistema", def: "O conjunto de regras do jogo: como se criam personagens, que dados se rolam e como se resolvem as ações. D&D e Ordem Paranormal são sistemas." },
  { termo: "Campanha", def: "Uma história longa jogada ao longo de várias sessões, com os mesmos personagens." },
  { termo: "Sessão", def: "Cada encontro do grupo para jogar. Normalmente dura de três a cinco horas." },
  { termo: "One-shot", def: "Uma aventura curta, com começo, meio e fim numa única sessão." },
  { termo: "Ficha", def: "O registro do personagem: atributos, perícias, equipamentos e história." },
  { termo: "NPC", def: "Non-Player Character. Qualquer personagem do mundo interpretado pelo mestre, do rei ao taverneiro." },
  { termo: "d20", def: "Dado de vinte faces, o mais famoso do RPG. A notação “2d6” significa rolar dois dados de seis faces." },
  { termo: "Teste", def: "Rolar dados para ver se uma ação dá certo, comparando o resultado com uma dificuldade definida pelo mestre." },
];

export type Sistema = { id: string; nome: string; logo: string; resumo: string[]; destaques: string[] };

export const SISTEMAS: Sistema[] = [
  {
    id: "dnd",
    nome: "Dungeons & Dragons",
    logo: dnd,
    resumo: [
      "Dungeons & Dragons (D&D) é o jogo que inventou o RPG de mesa como o conhecemos. Lançado em 1974 por Gary Gygax e Dave Arneson, ele pegou os jogos de guerra com miniaturas e acrescentou uma camada de narrativa colaborativa: em vez de mover exércitos, cada jogador cria um personagem (mago, guerreiro, ladino, clérigo e outros) e vive aventuras em grupo, guiado por um mestre, o Dungeon Master.",
      "O coração do sistema é o d20. Quase toda ação com risco ou incerteza, como atacar um monstro, convencer um guarda ou escalar uma muralha, é resolvida rolando um d20, somando os modificadores do personagem e comparando com uma dificuldade. Seis atributos (Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma) definem o personagem, que sobe do nível 1 ao 20 ao longo da campanha.",
      "A 5ª edição, de 2014, tornou o jogo mais acessível com a regra de vantagem e desvantagem: em situações favoráveis você rola dois d20 e fica com o maior. Em 2024 as regras foram revisadas. Hoje o D&D é publicado pela Wizards of the Coast, tem cenários famosos como Forgotten Realms e um documento de regras básicas (SRD) gratuito sob licença Creative Commons.",
    ],
    destaques: ["Dado principal: d20", "Fantasia heroica", "Níveis 1 a 20", "Ótimo para começar"],
  },
  {
    id: "pathfinder",
    nome: "Pathfinder",
    logo: pathfinder,
    resumo: [
      "Pathfinder nasceu em 2009, criado pela editora Paizo a partir das regras da edição 3.5 de D&D. Quando o D&D mudou de rumo com a 4ª edição, muitos grupos queriam continuar no estilo antigo, cheio de opções, e o Pathfinder virou a casa deles.",
      "A 2ª edição, de 2019, trouxe o sistema de três ações: no seu turno você tem três ações para gastar como quiser, seja andar, atacar, levantar o escudo ou conjurar uma magia de duas ações. Outra marca do sistema são os graus de sucesso: superar a dificuldade por 10 ou mais é um sucesso crítico, e errar por 10 ou mais é uma falha crítica.",
      "É um sistema que recompensa quem gosta de montar personagens com cuidado, com ancestralidades, heranças, antecedentes e talentos a cada nível. O mundo oficial se chama Golarion. Desde a versão Remaster de 2023 as regras são publicadas sob a licença aberta ORC, e todas ficam disponíveis de graça on-line.",
    ],
    destaques: ["Dado principal: d20", "Três ações por turno", "Muitas opções de personagem", "Regras abertas e gratuitas"],
  },
  {
    id: "ordem",
    nome: "Ordem Paranormal",
    logo: ordem,
    resumo: [
      "Ordem Paranormal é um RPG brasileiro de horror e investigação criado por Rafael Lange, o Cellbit. Ele surgiu como uma série de campanhas transmitidas ao vivo e virou um fenômeno, até ganhar um livro de regras próprio, publicado pela Jambô Editora em 2022 depois de um dos maiores financiamentos coletivos de RPG do Brasil.",
      "Os jogadores são agentes da Ordo Realitas, uma organização secreta que enfrenta ameaças do Outro Lado, uma realidade paranormal que invade o nosso mundo através do medo. O paranormal se divide em elementos (Sangue, Morte, Conhecimento e Energia, todos nascidos do Medo), e cada um tem criaturas e rituais próprios.",
      "Nos testes, você rola uma quantidade de d20 igual ao valor do atributo (Agilidade, Força, Intelecto, Presença ou Vigor) e fica com o maior resultado. Os agentes são Combatentes, Especialistas ou Ocultistas e evoluem pelo NEX, o Nível de Exposição Paranormal. Quanto mais poder, mais perto do Outro Lado, e a Sanidade sempre cobra o preço.",
    ],
    destaques: ["Feito no Brasil", "Horror investigativo", "Vários d20, fica o maior", "Sanidade e rituais"],
  },
  {
    id: "old-dragon",
    nome: "Old Dragon",
    logo: oldDragon,
    resumo: [
      "Old Dragon é um RPG brasileiro de fantasia, publicado pela editora Buró desde 2010. Ele segue o movimento old school (OSR), que resgata o jeito de jogar das primeiras edições de D&D: regras curtas, personagens simples de criar e muito espaço para a criatividade do grupo.",
      "Aqui a solução de um problema raramente está na ficha. Em vez de rolar um dado de perícia para achar uma armadilha, o jogador descreve onde procura e como, e o mestre decide o que acontece. A exploração de masmorras, a gestão de recursos (tochas, comida, flechas) e o perigo constante são o centro da experiência.",
      "Os atributos são gerados rolando 3d6, e as classes clássicas (Guerreiro, Clérigo, Ladrão e Mago) se combinam com raças como humanos, elfos, anões e halflings. A segunda edição, Old Dragon 2, renovou as regras e ampliou o jogo com novas especializações de classe, mantendo a mesma filosofia: um sistema leve, rápido e letal.",
    ],
    destaques: ["Feito no Brasil", "Estilo old school", "Regras leves", "Exploração e perigo"],
  },
];
