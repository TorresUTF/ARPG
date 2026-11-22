# Rolamento, pulo, energia, mana e o Ferreiro de Cinzas em `src/` (m-3)

*   **Autor:** Gabriel Torres Andreassa
*   **Estado:** Rascunho
*   **Data:** 2026-11-22

--------------------------------------------------------------------------------

## Visão geral

A etapa m-3 leva para o jogo de verdade (`src/`) o que o protótipo
`prototipos/esquiva-pulo/` testou e o autor aprovou na task-12:

*   **Rolamento (D):** curto, invencível por um instante, custa energia.
*   **Pulo (F):** parado no lugar, protege só de golpe rasteiro, custa energia.
*   **Energia:** paga o D e o F, com taxa extra para esquivas em sequência.
    Volta rápido depois de uma pausa.
*   **Mana:** paga Q, W, E e R.
*   **Ferreiro de Cinzas:** o segundo chefe, um duelista agressivo feito para
    testar o D e o F.
*   **Ação recusada e o primeiro som do jogo:** um bipe quando o jogador tenta
    algo que não pode pagar.

Fontes deste documento, em ordem:

1.  `concepts_brief-chefe-novo.md`: as regras decididas no brainstorm. Fica
    guardado como registro e não é alterado.
2.  `prototipos/esquiva-pulo/` (rodada 2, task-13): os golpes, o ritmo e os
    números que o autor jogou e aprovou. Onde a rodada 2 mudou algo do brief,
    vale a rodada 2.

## O problema

O `VISAO.md` promete um personagem com duas ações fixas (D e F), energia e
mana. O jogo em `src/` não tem nenhuma delas. Hoje a única defesa do jogador é
andar, o E (reposiciona, com recarga longa) e o R (apara, com recarga de 12 s).
Sem o D e o F, um chefe agressivo vira injusto, porque não há resposta barata e
frequente para um golpe bem lido. E sem energia e mana, as habilidades só têm a
recarga como custo, o que deixa o pilar **Compromisso** pela metade.

O golem, o único chefe do jogo, foi feito antes do D e do F. Os golpes dele são
todos "inteiros" e ele não testa a nova defesa. Por isso a etapa traz um
segundo chefe junto.

O protótipo respondeu às perguntas de diversão: o golpe rasteiro dá para
reconhecer, o combo é vencido na 2ª ou 3ª tentativa, o chefe é agressivo e
ainda dá para kitar, o E continua útil ao lado do D, a mana cria decisões e o
som é reconhecido sem olhar a barra. O que falta é construir isso com a
qualidade de `src/`: regras testadas, números em `dados/` e o resto do jogo
(golem, horda, painel) sem quebrar.

## Objetivos

*   O jogador tem D e F, com as regras de proteção, direção e recuperação do
    brief, e os números da rodada 2 como valores iniciais em `dados/`.
*   Energia e mana existem, sempre visíveis, voltam cheias a cada luta e são
    conferidas no momento certo (ao apertar e de novo quando um comando
    guardado roda).
*   O resultado de um golpe tem três estados (**atingido**, **aparado** ou
    **esquivado**), e a causa do dano aparece na tela.
*   A simulação emite o evento "ação recusada" com o motivo (energia, mana ou
    recarga). Um bipe gerado por código toca para os três motivos.
*   O Ferreiro de Cinzas existe como chefe jogável, com os golpes da rodada 2
    (arco, varredura em linha, salto, martelada e o combo Martelo e Foice), o
    sprint antes do combo, o ímpeto, o ritmo quebrado (rajada e depois uma
    janela para kitar), a ordem que reage à última defesa do jogador e a
    varredura que pode ser virada contra ele.
*   O golem e a horda continuam funcionando, com o ajuste mínimo do brief: D e
    F contam como esquiva, o D não conta como "preso", e o E sem mana conta
    como indisponível.
*   As regras que podem ser medidas viram testes automáticos: margem do pulo,
    piso de aviso, combo que pode ser vencido e mana que não trava a abertura.

## Fora do escopo

*   Golpes altos e um eixo vertical na simulação. Uma etiqueta "rasteiro ou
    inteiro" basta.
*   Um motor genérico de chefes. O Ferreiro é escrito como um chefe, não como
    uma peça de uma fábrica de chefes.
*   Redesenhar o E.
*   Modelos 3D ou animações novas para o jogador, o golem e a horda. O
    Ferreiro ganha um modelo novo (ver "Decisões tomadas no draft").
*   Movimento durante o pulo.
*   Reajustar a horda.
*   Qualquer som além do "não pode".
*   A fenda e o atordoamento ao bater na parede (adiados no brief).
*   Níveis, arquétipos, armaduras, mundo aberto e tutorial.
*   As chaves de diagnóstico do protótipo (energia infinita, travar golpe,
    velocidade 0,5x etc.). Elas serviram para validar e não vão para o jogo,
    exceto o que já existe no painel de `src/`.

## Decisões tomadas no draft

Pontos em que a rodada 2 do protótipo diverge do brief, decididos pelo autor
em 22/11/2026.

*   **O D protege da lâmina.** A varredura e o golpe 1 do combo (martelo) são
    uma lâmina fina que passa pelo jogador em poucos passos. A invencibilidade
    do D cobre essa passagem, e isso fica assim, como no protótipo. O F continua
    sendo a resposta mais barata (20 de energia contra 30 do D) e é a única que
    deixa o chefe preso na recuperação punida.
    *   Consequência 1: a regra do brief "o rasteiro fica no chão mais que a
        invencibilidade do D" passa a valer só para golpes rasteiros de **área**
        (hoje, o salto). Ela não vale para golpes de **lâmina**.
    *   Consequência 2: a margem do pulo (proteção do F menos o tempo ativo do
        rasteiro ≥ 0,20 s) também vale só para os rasteiros de área. O salto
        cumpre: 0,55 − 0,35 = 0,20 s.
    *   Consequência 3: o texto de morte para a lâmina não pode dizer "o
        rolamento não protege". O texto exato fica para o plano técnico.
*   **Piso de aviso: 0,45 s.** O brief pedia 0,5 s. Vale o aviso do arco que o
    autor jogou (0,45 s, 27 passos). O piso vira um teste automático que quebra
    se qualquer aviso de golpe em `dados/` ficar abaixo de 27 passos. O risco
    aceito: golpes de 0,45 s em sequência dentro da rajada podem ficar difíceis
    de ler. Se isso acontecer, o ajuste vai para as recuperações da rajada, não
    para o piso.
    *   A martelada conta como anunciada pelo aviso de 0,7 s, ainda que a mira
        só trave 0,1 s antes de cair. Isso é intencional (só o D bem
        cronometrado escapa) e o teste do piso confere o aviso, não a trava.

*   **Teto do ímpeto: 7 m/s, acima do jogador.** O brief pedia um teto abaixo
    dos 5,5 m/s do jogador. Vale o protótipo: o chefe chega a 7 m/s (4,5 de
    base mais até 2,5 de ímpeto), e o sprint antes do combo chega a 9 m/s por
    até 0,5 s. Fugir em linha reta não basta, e o jogador precisa de D, E ou de
    um golpe para se soltar. O ímpeto zera quando o chefe acerta, e isso vira
    teste. O risco aceito: a luta virar uma sequência de D e E, e o pilar
    "ganância no kiting" encolher. A janela para kitar depois da rajada (chefe
    a 0,5 da velocidade por 2 s) é o que segura esse pilar.
*   **Combo e energia: o teste continua, com os números de `dados/`.** A barra
    caiu de 100 para 85, mas a conta do brief não depende do máximo: o combo
    custa 65 (F 20, D 30 e taxa 15) e, durante o aviso de 1,2 s, a energia
    regenera cerca de 24 (1,2 s menos 0,8 s de espera, a 60 por segundo). O
    teste automático confere duas coisas com os valores lidos de `dados/`: que
    o combo pode ser vencido começando o aviso com o custo total, e que o custo
    total cabe na barra cheia (65 ≤ 85). Como o D também protege do golpe 1, a
    saída D e D custa 75 e também cabe.

*   **O Guardião vira o Ferreiro.** O lugar "Guardião" de `dados/mapa.json`
    (tipo chefe) passa a montar o Ferreiro de Cinzas. O golem continua nas
    dungeons como mini-chefe e na sala de treino. Os testes que esperam golem
    no Guardião mudam junto.

*   **A regra "a mana dura 30 s" cai.** Com os números da rodada 2 (mana 100,
    regeneração 3/s, custos Q 15, W 20, E 25, R 15), usar tudo assim que a
    recarga acaba dá a primeira recusa por volta de 10 s. O autor jogou assim e
    aprovou: a mana pune quem é displicente e força decisões. O teste
    automático passa a conferir só que a mana não trava a abertura (as quatro
    habilidades saem juntas com a mana cheia). O risco aceito, já avisado no
    brief: a horda fica mais difícil.

*   **O Ferreiro ganha um modelo 3D novo, e a postura dele vira o aviso.**
    Isso muda o brief, que deixava modelos e animações de fora. O modelo é
    mais elaborado que os atuais, para testar como o jogo fica numa versão mais
    perto da final. Ele tem:
    *   a foice e o martelo;
    *   animações de varredura da foice, de martelada e de pulo, cada uma com
        início, meio e fim;
    *   animações de andar, de sprint e de cansado (a janela para kitar).
    *   **A postura substitui os dois avisos de cor:** a troca de cor do corpo
        e a área desenhada no chão. O aviso do Ferreiro passa a ser só a
        postura.
    *   **Isso não foi validado.** A legibilidade aprovada na task-12 foi com
        avisos coloridos no chão. Pela trilha Estrutura, o modelo e as poses
        passam antes por uma **rodada 3 do protótipo**. A parte do modelo e dos
        avisos neste draft fica pendente até o autor aprovar a rodada 3. O resto
        do draft (D, F, energia, mana, regras do Ferreiro, som e painel) não
        depende dela.
    *   **Tecnologia: modelo feito no Blender, com esqueleto e animações,
        exportado em glTF.** O three.js já traz o leitor de glTF, então nenhum
        pacote novo entra no `package.json`. Entram arquivos de arte no projeto
        e uma linha nova em `rules/tecnologia.md` (o Blender como ferramenta de
        arte e o glTF como formato). Cada animação toca ajustada à duração da
        fase que ela representa, lida de `dados/`, para que mudar um tempo no
        painel não exija refazer a animação.
    *   O risco aceito: alguém precisa modelar e animar no Blender, e cada
        mudança de forma de um golpe (não de tempo) exige voltar ao Blender.
    *   **Quem faz:** o autor (ou o irmão), no Blender, seguindo a "Ficha do
        modelo do Ferreiro" abaixo. Enquanto o modelo não fica pronto, a parte
        de `src/` que não depende dele segue normalmente. A rodada 3 do
        protótipo começa quando o arquivo existir.
    *   **Ponto de partida: um script Python para o Blender** (decidido pelo
        autor em 22/11/2026). O Claude escreve um script que monta um
        **rascunho** do Ferreiro: corpo de formas simples, esqueleto, foice,
        martelo e as 15 animações com os nomes da ficha. O autor (ou o irmão)
        abre o script no Blender, roda e refina à mão. O rascunho já segue a
        ficha (tamanho, origem, frente, poses legíveis de cima), então serve
        até para começar a rodada 3 antes do modelo final.
    *   O script fica em `prototipos/ferreiro-3d/rascunho_ferreiro.py`: é
        descartável, como todo protótipo (`rules/pastas.md`). Depois que o
        modelo for refinado à mão, rodar o script de novo **apaga o trabalho
        manual**. Ele serve só para começar, não para manter o modelo.
    *   **Divergência com `design/arte-prompts.md`:** as regras de leitura de lá
        dizem que o chefe troca o brilho do corpo no preparo e que o vermelho
        forte fica nas áreas de golpe no chão. O Ferreiro não segue essas duas
        regras. Se a rodada 3 aprovar a postura, o documento ganha uma exceção
        para o Ferreiro.

## Ficha do modelo do Ferreiro (para o Blender)

O que o jogo precisa ler do arquivo. O resto (estilo, cores, detalhes) é livre.

### Arquivo

*   Um arquivo só: `src/apresentacao/arte/ferreiro.glb` (no Blender: File >
    Export > glTF 2.0, formato "glTF Binary"). O protótipo da rodada 3 lê o
    mesmo arquivo.
*   O modelo, o esqueleto, a foice, o martelo e todas as animações vão dentro
    dele.

### Tamanho e posição

*   **1 unidade do Blender = 1 metro.**
*   O corpo cabe num círculo de **0,9 m de raio** visto de cima. É o tamanho
    com que o jogo calcula colisão. Armas podem sair desse círculo nos golpes.
*   Altura em torno de **2,2 m**, parecida com a do golem.
*   A origem fica **entre os pés, no chão** (altura zero).
*   O modelo olha para a **frente do Blender** (vista Front, tecla 1 do teclado
    numérico). O código gira o modelo para o jogador.

### Regra de ouro das animações

*   **A câmera é alta, quase de cima.** A postura tem que ser lida **vista de
    cima**: braços, foice e martelo bem abertos para os lados ou bem erguidos.
    Um gesto que só se vê de frente não serve como aviso. Confira no Blender
    pela vista Top (tecla 7) antes de exportar.
*   **Todas as animações ficam no lugar.** O personagem não sai da origem: o
    código move o Ferreiro pela arena (inclusive no pulo e no sprint).
*   **A duração de cada animação é livre.** O código estica ou encurta cada uma
    para durar exatamente o tempo da fase em `dados/`.

### Animações (nomes exatos)

Cada golpe tem três animações, que o jogo toca nas três fases da ação
(`design/acoes.md`):

| Nome no Blender | Fase do jogo | O que precisa mostrar |
|---|---|---|
| `varredura_inicio` | preparo (o aviso) | a foice baixa, perto do chão, puxada para um lado: "vai varrer embaixo, pule" |
| `varredura_meio` | ativo | a foice varre rente ao chão, **da direita para a esquerda** do Ferreiro, num arco largo à frente |
| `varredura_fim` | recuperação | volta à guarda |
| `martelada_inicio` | preparo | o martelo erguido acima da cabeça: "vai bater de cima, role" |
| `martelada_meio` | ativo | o martelo cai e bate no chão à frente (curto: é o impacto) |
| `martelada_fim` | recuperação | levanta o martelo do chão |
| `pulo_inicio` | preparo (agachar **e** o tempo no ar) | agacha e sobe; termina no ponto mais alto, armas prontas para cair |
| `pulo_meio` | ativo | aterrissa com força (o dano é aqui) |
| `pulo_fim` | recuperação | se levanta do pouso |
| `foice_alta_inicio` | preparo | a foice erguida na altura do peito, puxada para trás: "vai cortar alto, role" (diferente da varredura baixa) |
| `foice_alta_meio` | ativo | a foice corta na altura do peito, num arco à frente |
| `foice_alta_fim` | recuperação | volta à guarda |
| `andar` | perseguindo (repete) | anda com as armas em guarda |
| `sprint` | sprint antes do combo (repete) | corre inclinado para a frente |
| `cansado` | janela para kitar (repete) | ofegante, armas baixas: "agora é sua vez" |

*   **Quais golpes usam cada animação** (decidido pelo autor em 22/11/2026):
    *   varredura e golpe 1 do combo ("martelo", também rasteiro): `varredura_*`;
    *   arco de lâmina e golpe 2 do combo ("foice", os dois inteiros):
        `foice_alta_*`. Os dois pedem a mesma resposta (D), então a pose igual
        não engana o jogador;
    *   martelada: `martelada_*`; salto: `pulo_*`;
    *   atordoado (depois do R) e punido (depois de pular a varredura):
        `cansado`.
*   A varredura e a foice alta acontecem nos dois sentidos no jogo. O código
    espelha a animação para o outro lado (a foice troca de mão no espelho).
*   O "meio" de cada golpe é o momento em que ele pode acertar. O golpe tem que
    parecer perigoso durante o meio inteiro e não antes.

### Rascunho pelo script

*   No Blender: aba **Scripting** > abrir
    `prototipos/ferreiro-3d/rascunho_ferreiro.py` > **Run Script**. O script
    limpa a cena, monta o rascunho e deixa tudo pronto para exportar.
*   O rascunho cumpre a ficha, mas é feio de propósito: blocos e cilindros. O
    refino (forma, detalhes, cores, suavidade das animações) é à mão.
*   O script testa a ficha, não a arte: se as poses `_inicio` do rascunho já
    se leem de cima, o modelo final só precisa não estragar isso.

### Como saber se está pronto

*   Importado de volta num Blender vazio (File > Import > glTF 2.0), o arquivo
    mostra o modelo com as 15 animações pelos nomes da tabela.
*   Vista de cima, dá para dizer qual golpe vem só pela pose `_inicio`.

## Perguntas em aberto

Respondidas pela rodada 3 do protótipo, antes da parte visual ir para `src/`:

*   **O salto sem o círculo no chão:** a task-13 aprovou o salto com "o aviso
    mostra onde ele vai cair". Só com a postura, como o jogador sabe onde o
    chefe vai cair?
*   **A martelada sem o círculo no chão:** a mira segue o jogador até 0,1 s
    antes de cair. A postura precisa mostrar o momento da trava, ou o D na hora
    certa vira adivinhação.
*   **Rasteiro ou inteiro pela postura:** o jogador precisa distinguir varredura
    (pule) de arco e foice (role) só pelo corpo. A resposta (a) da validação
    precisa ser refeita.
*   **A opção de aviso da página** (completa, parcial ou escondida): ela deixa
    de valer para o Ferreiro ou continua como ajuda de teste?

--------------------------------------------------------------------------------

## Plano técnico

### Como as peças se ligam

A regra de `rules/arquitetura.md` continua: a simulação recebe comandos e
emite eventos; a apresentação e o som só reagem aos eventos. O que muda é o que
passa por cada caminho.

```text
 teclado / mouse
      │  D, F (novas)      Q W E R
      ▼
 src/controle/entrada.ts ──► comandos: "rolar", "pular", "habilidade" ...
      │
      ▼
 src/simulacao/
   jogador.ts ──── confere energia / mana / recarga
      │              └─ se não pode: evento "acaoRecusada" {motivo}
      │
   recursos.ts (novo) ── energia e mana: gastar, taxa em sequência, regenerar
      │
   luta.ts ──── protecaoDoJogador(altura)  ◄── usada por TODOS os golpes
      │          resultado: atingido | aparado | esquivado (D, F)
      │
   inimigos.ts ── escolhe quem atualiza: golem | ferreiro | horda
      │                 │
      │          ferreiro.ts (novo) ── golpes, sprint, ímpeto, rajada,
      │                                janela para kitar, escolha contra
      │                                a última defesa
      ▼
 eventos: golpeResolvido {resultado, altura, golpe}, acaoRecusada {motivo}, ...
      │
      ├──► src/apresentacao/efeitos.ts  (textos, causa do dano)
      ├──► src/apresentacao/som.ts (novo) (bipe de "não pode")
      └──► src/apresentacao/cenaLuta.ts (barras de energia e mana, caixas D e F,
                                         formas dos golpes do Ferreiro)
```

### 1. D e F são ações, como as outras

O D (`"d"`) e o F (`"f"`) entram como ações de três fases em
`src/simulacao/acao.ts`, com os números em `dados/`:

*   **D (rolamento):** sem preparo. A fase ativa é o movimento (a distância
    dividida pela duração, como o E). A invencibilidade vale nos primeiros
    passos da fase ativa (`invencivel` em segundos, menor ou igual à duração do
    movimento). Depois vem a recuperação.
*   **F (pulo):** sem preparo. A fase ativa é a proteção contra rasteiro. O
    personagem não anda. Depois vem a recuperação.
*   Os dois seguem `design/acoes.md`: mover ou usar habilidade corta a
    recuperação, e o comando dado durante outra ação fica guardado. O D e o F
    entram na fila de guardados com a mesma prioridade das habilidades.
*   **Sem recarga.** O custo é a recuperação e a energia. Essa é a exceção
    escrita em `design/habilidades.md`.
*   **Direção do D:** a do mouse. Se o mouse está em cima do personagem (dentro
    do raio dele), vale a última direção de movimento.
*   **O D atravessa corpos.** Durante a fase ativa do D, `separarCorpos`
    (`src/simulacao/mundo.ts`) não empurra o jogador para fora dos inimigos.
    Se o D terminar dentro do corpo de um chefe, o empurrão normal volta no
    passo seguinte.

### 2. Energia e mana (`src/simulacao/recursos.ts`, novo)

O jogador ganha dois números: `energia` e `mana`. As regras ficam num arquivo
próprio para não inchar `jogador.ts`:

*   **Energia:**
    *   O D custa `custoD` e o F custa `custoF`.
    *   **Em sequência:** se um D ou F começa até `janelaSequencia` segundos
        depois do fim do movimento do D ou F anterior, paga mais
        `taxaSequencia`. A taxa vale para todos os pares e não acumula. O
        jogador guarda o passo em que o último movimento de D ou F terminou.
    *   **Regeneração:** a energia só volta depois de `esperaEnergia` segundos
        sem gastar, a `regenEnergia` por segundo, até o máximo.
    *   O D e o F só começam se houver energia para o custo inteiro (com a
        taxa). Senão, a ação é recusada com motivo "energia".
*   **Mana:**
    *   Cada habilidade ganha `custoMana` no seu arquivo de `dados/`.
    *   Uma habilidade só sai se a recarga estiver pronta **e** houver mana. A
        mana é conferida quando a tecla é apertada e de novo quando o comando
        guardado roda. É paga no começo da ação, junto com o início da recarga.
    *   Se faltar mana, a ação é recusada e a recarga não começa.
    *   Regenera de forma contínua, a `regenMana` por segundo.
    *   A mana nunca bloqueia o D nem o F.
*   As duas voltam cheias a cada luta (em `criarMundo`). A poção não devolve
    mana.

### 3. Ação recusada

`jogador.ts` emite `{ tipo: "acaoRecusada", motivo: "energia" | "mana" | "recarga", acao }`
quando um comando de D, F ou habilidade não pode ser pago. O evento sai uma vez
por aperto de tecla: um comando guardado que é recusado ao rodar emite de novo,
porque é uma tentativa nova.

Hoje, um comando de habilidade em recarga é ignorado em silêncio. Passa a emitir
o evento com motivo "recarga". A regra de ignorar continua.

### 4. Quando um golpe acerta: proteção única para todos

Hoje, `atingirJogador` em `src/simulacao/luta.ts` só conhece o aparo. Ela
passa a receber a **altura** do golpe (`"rasteiro"` ou `"inteiro"`) e devolve
um de três resultados:

| Ação do jogador neste passo | Golpe inteiro | Golpe rasteiro |
|---|---|---|
| R na janela | aparado | aparado |
| D na invencibilidade | esquivado (D) | esquivado (D) |
| F na fase ativa | **atingido** | esquivado (F) |
| nenhuma das anteriores | atingido | atingido |

*   Golem, horda (disparos e áreas) e Ferreiro usam a mesma função. Tudo o que
    a horda e o golem fazem é inteiro.
*   O disparo da horda esquivado atravessa o jogador e continua voando.
*   A função emite `{ tipo: "golpeResolvido", resultado, altura, golpe, atacante }`
    para a apresentação mostrar a causa do dano. O evento `jogadorAtingido`
    continua igual.
*   **O golem continua conferindo uma vez**, ao entrar na fase ativa, como faz
    hoje. Mudar isso mudaria a sensação do golem, e não é o pedido.
*   **O Ferreiro confere a cada passo da fase ativa.** O golpe acerta no
    primeiro passo em que o jogador está na área e sem proteção, uma vez só.
    Se o jogador estava protegido nesse passo, o golpe registra "esquivado" e
    não confere mais. Assim funciona no protótipo, e é isso que faz o D passar
    pela lâmina.

### 5. O Ferreiro de Cinzas (`src/simulacao/ferreiro.ts`, novo)

O Ferreiro é um tipo novo de inimigo (`"ferreiro"`). `inimigos.ts` chama
`atualizarFerreiro` para ele, como já chama `atualizarGolem` para o golem. O
estado próprio dele (ímpeto, rajada, janela, sprint, última defesa do jogador,
recarga do combo, se está punido) fica num campo `ferreiro?` do `Inimigo`,
como o golem tem `cerebro?`.

**Golpes.** Cada golpe é uma ação de três fases com uma entrada em `dados/`,
uma forma e uma altura:

| Golpe | Forma | Altura | Observação |
|---|---|---|---|
| Arco de lâmina | cone à frente | inteiro | |
| Varredura | lâmina que gira de um lado ao outro | rasteiro | pular deixa o chefe na recuperação punida |
| Salto | círculo onde o jogador estava | rasteiro | o chefe voa até lá; dano ao aterrissar |
| Martelada | círculo pequeno no jogador | inteiro | a mira segue o jogador até `travar` segundos antes de cair |
| Combo: martelo | lâmina, como a varredura | rasteiro | aviso longo (`avisoCombo`), sem recuperação |
| Combo: foice | lâmina, no sentido contrário | inteiro | vem logo depois do martelo; recuperação = castigo do combo |

*   **Lâmina:** a cada passo da fase ativa, o ângulo da lâmina anda do começo
    ao fim do arco. O jogador está "na área" quando a lâmina passa por cima
    dele (largura da lâmina mais o raio do jogador).
*   **Durante o golpe**, o chefe continua andando até o jogador a
    `velAtaque` vezes a velocidade dele.
*   **Combo:** o martelo emenda a foice como um golpe novo, no sentido
    contrário. Se o martelo for aparado, o chefe fica atordoado e a foice não
    sai.

**Movimento e ritmo.** O Ferreiro está sempre num destes estados:

```text
 perseguindo ──(no alcance de um golpe)──► golpe ──► (rajada acabou?) ──► janela
      ▲                                     │ não                         │
      │                                     └──► próximo golpe da rajada  │
      └─────────────────────── (janela acabou) ◄──────────────────────────┘

 perseguindo ──(combo pronto e longe)──► sprint ──► combo (martelo → foice)
```

*   **Rajada:** sorteia (com a semente da luta) de `rajadaMin` a `rajadaMax`
    golpes. Dentro da rajada, a recuperação de cada golpe é multiplicada por
    `fatorRajada`, exceto a do combo e a recuperação punida.
*   **Janela para kitar:** depois da rajada, o chefe só persegue, a
    `velJanela` vezes a velocidade, por `janelaKitar` segundos.
*   **Sprint:** com o combo pronto e o jogador além do alcance do combo mais
    `sprintAlcance`, o chefe corre a `velSprint` até chegar ou até
    `sprintMax` segundos, e então começa o combo.
*   **Ímpeto:** enquanto persegue, a velocidade extra sobe `impetoSobe` por
    segundo, até `impetoMax − velocidade`. Zera quando o chefe acerta.

**Escolha do golpe contra a última defesa.** O Ferreiro guarda a última
defesa que o jogador usou contra ele (D, F, R ou nenhuma). Os golpes que
servem pela distância são sorteados por peso, com a semente da luta. Os pesos
mudam conforme a última defesa, como no protótipo:

*   Depois de um D: varredura 3, salto 2, martelada 1 (o rasteiro de área pune
    quem rola).
*   Depois de um F: martelada 3 (o pulo não cobre um golpe inteiro).
*   Depois de um R: martelada 2.
*   O salto só serve com o jogador a pelo menos `minSalto` metros.

Os pesos ficam em `dados/`, para o painel ajustar.

**Golpe virado contra ele.** Pular a varredura (esquivado pelo F) troca a
recuperação dela pela `recupPunida` (cerca de 1 s parado). O R funciona em
qualquer golpe e atordoa, como no golem.

**Modelo 3D.** Pendente da rodada 3 do protótipo (ver "Decisões tomadas no
draft"). A simulação já deixa à mostra o que as poses precisam saber: o golpe
em curso, a fase dele e quanto dela já passou (`progressoDaFase`), e o estado
do Ferreiro (perseguindo, sprint, janela, atordoado, punido). A apresentação lê
esses dados sem mudar as regras, como faz com o golem.

### 6. O golem: ajuste mínimo

Em `src/simulacao/cerebroGolem.ts`:

*   O D e o F contam como esquiva na nota "esquiva" do perfil, como o E conta
    hoje.
*   O D não conta como "preso" para o estilo Garantir.
*   No estilo Paciente, o E sem mana conta como indisponível, como o E em
    recarga. O texto do motivo passa a ser "seu E não está disponível".
*   Golpe esquivado conta como erro no peso do golpe, como "saiu da área".

### 7. Onde o Ferreiro aparece

`Sala` (em `src/simulacao/dados.ts` e `dados/mapa.json`) ganha o campo
`chefe: "golem" | "ferreiro"`. O Guardião passa a `"ferreiro"`, com a vida do
Ferreiro. As dungeons continuam `"golem"`. `criarMundo` monta o chefe pelo
campo. A sala de treino continua com o golem.

### 8. Tela, painel e som

*   **Barras:** energia e mana logo abaixo da vida do jogador. A mana não usa o
    azul-claro do jogador. A barra de energia mostra marcas com o custo do
    próximo D e do próximo F (com a taxa, se ela valeria agora).
*   **Caixas D e F** ao lado de Q, W, E e R, apagadas sem energia para pagar.
    A caixa de uma habilidade mostra "sem mana" de um jeito diferente de "em
    recarga".
*   **Golpes do Ferreiro:** o aviso é a postura do modelo novo, sem cor no
    corpo e sem área no chão. Os detalhes ficam pendentes da rodada 3 do
    protótipo.
*   **Textos:** o motivo da recusa ("sem energia", "sem mana", "em recarga") e
    a causa do dano. O texto de morte depende de forma e altura:
    *   rasteiro de área: "rasteiro: o rolamento não protege; pule (F) ou saia
        da área";
    *   rasteiro de lâmina: "rasteiro: pule (F), role na hora (D) ou saia da
        área";
    *   inteiro: "golpe inteiro: o pulo não protege; role (D), apare (R) ou
        saia da área".
*   **Som (`src/apresentacao/som.ts`, novo):** ouve os eventos no mesmo ponto
    que `efeitos.ts`. Toca um bipe de onda quadrada para `acaoRecusada`, no
    máximo um a cada 150 ms. O áudio só liga depois da primeira tecla ou do
    primeiro clique. A página ganha uma caixa de mudo. A frequência e a duração
    ficam em `dados/som.json` e aparecem no painel.
*   **Painel:** todo campo novo de `dados/` ganha rótulo em
    `src/painel/rotulos.ts`. O teste do painel já confere isso.

### 9. Teclas

`src/controle/entrada.ts` transforma D em `{ tipo: "rolar", ponto }` e F em
`{ tipo: "pular" }`. A tela cheia sai do F e vai para o L em `src/main.ts`,
`index.html` (textos dos botões e da ajuda) e `design/controle.md`.

### 10. Testes automáticos novos

Todos leem os números de `dados/`, para continuar valendo depois de um ajuste
no painel:

*   **Margem do pulo:** para cada golpe rasteiro de área, a proteção do F menos
    o tempo ativo do golpe é de pelo menos 0,20 s (12 passos). O tempo ativo do
    golpe também é maior que a invencibilidade do D.
*   **Piso de aviso:** todo aviso de golpe (golem, Ferreiro e o intervalo do
    combo) tem pelo menos 27 passos (0,45 s).
*   **Combo pode ser vencido:** o custo total (F, D e taxa) cabe na energia
    máxima, e começar o aviso com o custo total menos o que regenera no aviso
    basta para pagar as duas esquivas.
*   **Mana não trava a abertura:** com a mana cheia, Q, W, E e R saem juntos
    no começo da luta sem recusa (a soma dos custos cabe na mana máxima).
*   **Ímpeto zera ao acertar.**
*   **Tabela de proteção:** cada linha da tabela da seção 4 vira um caso.
*   **Repetição exata:** a gravação de uma luta com o Ferreiro se reproduz
    igual, como o teste que já existe para o golem.

Os testes que já existem e usam habilidades seguidas passam a zerar o
`custoMana` na cópia de `dados/` que cada teste monta. Assim eles testam o
mesmo que antes.
